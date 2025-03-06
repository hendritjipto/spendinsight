export default async function getMonth(date) {
    try {
        const transactionDate = new Date(date);
        // Create first day of month and ensure it stays on the correct day regardless of timezone
        const firstDayOfMonth = new Date(Date.UTC(
            transactionDate.getFullYear(),
            transactionDate.getMonth(), 
            1, 0, 0, 0
        ));
        return firstDayOfMonth;
    } catch (error) {

    } finally {
    }
}