import './styles.css';
import {useEffect, useRef} from 'react';
import * as Y from 'yjs';
import {QuillBinding} from 'y-quill';
import {WebsocketProvider} from 'y-websocket';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import {authService} from "../../services/authService.ts";
import {generateChatColor} from "../../utils/colorUtils.ts";

Quill.register('modules/cursors', QuillCursors);

export const EditorPage = () => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillInstance = useRef<Quill | null>(null);
    const bindingRef = useRef<QuillBinding | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const ydocRef = useRef<Y.Doc | null>(null);

    // TODO: replace by real UUID
    const docId = 'docexample';

    useEffect(() => {
        const authToken = authService.getToken();
        if (!editorRef.current || !authToken) return;

        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;

        // Initialize Quill only after DOM is ready
        const quill = new Quill(editorRef.current, {
            modules: {
                cursors: true,
                toolbar: [
                    [{header: [1, 2, false]}],
                    ['bold', 'italic', 'underline'],
                    ['image', 'code-block'],
                ],
                history: {
                    userOnly: true,
                },
            },
            placeholder: 'Start collaborating...',
            theme: 'snow',
        });
        quillInstance.current = quill;

        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        const provider = new WebsocketProvider(
            `ws://localhost:3000/ws/`,
            `webchat/${docId}`,
            ydoc,
            {params: {yauth: authToken}}
        );
        providerRef.current = provider;

        const awareness = provider.awareness;
        awareness.setLocalStateField('user', {
            name: currentUser.username,
            color: generateChatColor('username')
        });

        const ytext = ydoc.getText('quill');
        const binding = new QuillBinding(ytext, quill, awareness);
        bindingRef.current = binding;

        return () => {
            provider.destroy();
            binding.destroy();
            ydoc.destroy();
        };
    }, [docId]);

    return (
        <>
            <div id="editor" ref={editorRef} style={{height: '500px'}}/>
        </>
    );
};
