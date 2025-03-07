export default async function getMonth(date) {
    try {
        const transactionDate = new Date(date);
        // Create first day of month and ensure it stays on the correct day regardless of timezone
        const firstDayOfMonth = new Date(Date.UTC(
            transactionDate.getUTCFullYear(),  // Use getUTCFullYear to avoid local timezone effects
            transactionDate.getUTCMonth(),     // Use getUTCMonth to avoid local timezone effects
            1, 0, 0, 0                         // Set time to midnight UTC
        ));
        return firstDayOfMonth;
    } catch (error) {

    } finally {
    }
}