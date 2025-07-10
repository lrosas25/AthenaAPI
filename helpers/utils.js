
import fs from 'fs';

export const removeLinesFromCSV = async (filePath, start = 0, ending = 0) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8').split('\n');
        const totalLines = data.length;

        // Ensure start and ending are within valid bounds
        start = Math.max(0, start);
        ending = Math.max(0, ending);
        ending = Math.min(ending, totalLines);

        // Handle the case where no lines are to be kept
        if (start >= totalLines || totalLines - ending <= 0) {
            return ''; // Return empty string if trimming results in no content
        }

        const trimmedData = data.slice(start, totalLines - ending).join('\n');
        return trimmedData;

    } catch (error) {
        console.error('Error trimming CSV:', error);
        throw error;
    }
};