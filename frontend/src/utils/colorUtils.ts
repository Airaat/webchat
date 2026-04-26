const calcHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32-bit int
    }

    return hash;
}

export const generateChatColor = (str: string) => {
    const palette = [
        "#FFADAD", "#FFD6A5", "#CAFFBF",
        "#9BF6FF", "#A0C4FF", "#BDB2FF",
        "#FFC6FF",
    ];
    const hash = calcHash(str);
    const index = Math.abs(hash) % palette.length;
    return palette[index];
}