/**
 * Scrolls a container to the bottom of its content.
 *
 * Modular by design: used by useScrollRestoration on first chat open,
 * by useAutoScrollOnNewMessage on send/receive, and intended for the future
 * floating "scroll to bottom" button.
 */
export function scrollToBottom(
    container: HTMLElement,
    behavior: ScrollBehavior = 'auto',
): void {
    container.scrollTo({top: container.scrollHeight, behavior});
}
