import { t } from 'elysia';

export const MonthlyRepairTrendByProductTypeReportDto = t.Object({
  productTypeName: t.String(),
  value: t.Number(),
});

export type MonthlyRepairTrendByProductTypeReport = typeof MonthlyRepairTrendByProductTypeReportDto.static;
