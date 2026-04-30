export interface IDateVerification
{
    IsValidDate(dateString: string): boolean;
    IsValidDateRange(startDateString: string, endDateString: string): boolean;
}

export class DateVerification implements IDateVerification
{
    IsValidDate(dateString: string): boolean
    {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    IsValidDateRange(startDateString: string, endDateString: string): boolean
    {
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
        {
            return false;
        }

        return startDate <= endDate;
    }
}
