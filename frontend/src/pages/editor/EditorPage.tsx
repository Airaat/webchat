import './styles.css';
import {useEffect, useRef} from 'react';
import * as Y from 'yjs';
import {QuillBinding} from 'y-quill';
import {WebsocketProvider} from 'y-websocket';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import {authService} from '../../services/authService.ts';
import {generateChatColor} from '../../utils/colorUtils.ts';
import {YHUB_WS_BASE_URL} from "../../const.ts";

Quill.register('modules/cursors', QuillCursors);

export const EditorPage = () => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    // TODO: replace by real UUID
    const docId = 'docexample';

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const authToken = authService.getToken();
        const currentUser = authService.getCurrentUser();
        if (!wrapper || !authToken || !currentUser) return;

        const editorContainer = document.createElement('div');
        editorContainer.style.height = '500px';
        wrapper.appendChild(editorContainer);

        const quill = new Quill(editorContainer, {
            modules: {
                cursors: true,
                toolbar: [
                    [{header: [1, 2, false]}],
                    ['bold', 'italic', 'underline'],
                    ['image', 'code-block'],
                ],
                history: {userOnly: true},
            },
            placeholder: 'Start collaborating...',
            theme: 'snow',
        });

        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider(
            YHUB_WS_BASE_URL,
            `webchat/${docId}`,
            ydoc,
            {params: {yauth: authToken}}
        );

        provider.awareness.setLocalStateField('user', {
            name: currentUser.username,
            color: generateChatColor(currentUser.username),
        });

        const binding = new QuillBinding(ydoc.getText('quill'), quill, provider.awareness);

        return () => {
            binding.destroy();
            provider.destroy();
            ydoc.destroy();
            wrapper.replaceChildren();
        };
    }, [docId]);

    return <div ref={wrapperRef}/>;
};
