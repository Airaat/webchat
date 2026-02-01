export const formatChatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});
    } else {
        return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
};

export const formatMessageTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const formatter = Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return formatter.format(date);
};