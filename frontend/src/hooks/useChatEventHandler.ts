import {useCallback, useEffect, useRef} from "react";
import {type InfiniteData, useQueryClient} from "@tanstack/react-query";
import {webSocketClient} from "../core/webSocketClient";
import type {ChatItem, ChatListData, ChatNotification, Message, MessagePageResponse, UserPresence} from "../types/chat";
import {selectChats} from "./useChats";
import {useChatUIStore} from "../store/chatUIStore.ts";

const CHAT_QUERY_KEY = ['chats'];
const MESSAGE_QUERY_KEY = ['messages'];

export const useChatEventHandler = () => {
    const queryClient = useQueryClient();
    const setConnectionStatus = useChatUIStore((s) => s.setConnectionStatus);
    const subscriptionsRef = useRef<Map<string, string>>(new Map());

    const onMessageReceived = useCallback((msg: Message) => {
        queryClient.setQueryData<InfiniteData<ChatListData>>(
            CHAT_QUERY_KEY,
            (old) => {
                if (!old) return old;

                const target = selectChats(old).find(c => c.id === msg.chatId);
                if (!target) return old;

                const updatedTarget: ChatItem = {
                    ...target,
                    lastMessage: msg.content,
                    lastMessageAt: msg.timestamp
                };

                const [firstPage, ...restPages] = old.pages;
                const nonTargetChats = (c: ChatItem) => c.id !== msg.chatId;

                return {
                    ...old,
                    pages: [
                        {
                            ...firstPage,
                            chats: [
                                updatedTarget,
                                ...firstPage.chats.filter(nonTargetChats)
                            ],
                        },
                        ...restPages.map(page => ({
                            ...page,
                            chats: page.chats.filter(nonTargetChats)
                        }))
                    ]
                };
            }
        );

        queryClient.setQueryData<InfiniteData<MessagePageResponse>>(
            [...MESSAGE_QUERY_KEY, msg.chatId],
            (old) => {
                if (!old) return old;

                const [firstPage, ...rest] = old.pages;
                const updatedFirstPage: MessagePageResponse = {
                    ...firstPage,
                    messages: [...firstPage.messages, msg],
                };

                return {
                    ...old,
                    pages: [updatedFirstPage, ...rest]
                }
            }
        );

        return msg;
    }, [queryClient]);

    const onPresenceUpdate = useCallback((presence: UserPresence) => {
        queryClient.setQueryData<InfiniteData<ChatListData>>(
            CHAT_QUERY_KEY,
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        chats: page.chats.map(chat => {
                            return chat.userId === presence.userId
                                ? {...chat, isOnline: presence.online}
                                : chat;
                        })
                    }))
                };
            }
        );
    }, [queryClient]);

    const onNotificationReceived = useCallback((notification: ChatNotification) => {
        // TODO: handle chatCreated, chatDeleted, chatUpdated, newMessage, messageDeleted
        // qc.setQueryData<InfiniteData<ChatListData>>(
        //     CHAT_QUERY_KEY,
        //     (old) => {
        //         // console.log("ignoring chat notification event: ", notification);
        //         return old;
        //     }
        // );
    }, []);

    const onError = useCallback((e: unknown) => {
        console.error('WebSocket error:', e)
    }, []);

    const subscribeToTopic = useCallback(
        <T, >(key: string, topic: string, handler: (data: T) => void) => {
            if (subscriptionsRef.current.has(key)) {
                return;
            }
            const subId = webSocketClient.subscribe<T>(topic, handler);
            subscriptionsRef.current.set(key, subId);
        },
        []
    );

    useEffect(() => {
        let isMounted = true;

        const setupSubscriptions = () => {
            if (!webSocketClient.isConnected) return;
            subscribeToTopic('messages', '/user/queue/messages', onMessageReceived);
            subscribeToTopic('presence', '/user/queue/presence', onPresenceUpdate);
            subscribeToTopic('notifications', '/user/queue/notifications', onNotificationReceived);
            subscribeToTopic('errors', '/user/queue/errors', onError);
        };

        const unsubscribe = webSocketClient.onConnectionChange((connected) => {
            setConnectionStatus(connected ? "connected" : "disconnected");
            if (connected && isMounted) {
                setupSubscriptions();
            }
        });

        if (webSocketClient.isConnected) {
            setupSubscriptions();
        }

        setConnectionStatus("connecting");
        webSocketClient.connect().catch((err) =>
            console.error('Failed to connect WebSocket:', err)
        );

        return () => {
            isMounted = false;
            unsubscribe();
            subscriptionsRef.current.forEach(subId => webSocketClient.unsubscribe(subId));
            subscriptionsRef.current.clear();
        }
    }, [
        subscribeToTopic,
        setConnectionStatus,
        onMessageReceived,
        onPresenceUpdate,
        onNotificationReceived,
        onError
    ]);
}