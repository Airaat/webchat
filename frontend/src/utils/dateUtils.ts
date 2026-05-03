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

export const fmtLastLogin = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    // Обработка некорректной даты
    if (isNaN(date.getTime())) {
        return 'invalid date';
    }

    // Форматирование времени (HH:MM)
    const formatTime = (d: Date): string => {
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Форматирование "месяц день" (например, "Jan 1")
    const formatMonthDay = (d: Date): string => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}`;
    };

    // Форматирование "месяц день год" (например, "Sep 1 2025")
    const formatMonthDayYear = (d: Date): string => {
        return `${formatMonthDay(d)} ${d.getFullYear()}`;
    };

    if (date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()) {
        return `today at ${formatTime(date)}`;
    }

    if (date.getFullYear() === now.getFullYear()) {
        return `${formatMonthDay(date)} at ${formatTime(date)}`;
    }

    // Разница в миллисекундах (365 дней ~ 31 536 000 000 мс)
    const diffMs = Date.now() - date.getTime();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;

    if (diffMs < oneYearMs) {
        return `${formatMonthDayYear(date)} at ${formatTime(date)}`;
    }

    return 'long time ago';
};