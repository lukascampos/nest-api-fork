import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../../repositories/report.repository';

export interface ListReportsInput {
  isSolved?: boolean;
  reporterId?: string;
  targetType?: 'product' | 'productRating' | 'user';
  take?: number;
  skip?: number;
}

type Output = Either<Error, unknown>;

@Injectable()
export class ListReportsUseCase {
  private readonly logger = new Logger(ListReportsUseCase.name);

  constructor(private readonly repo: ReportRepository) {
    this.logger.log('ListReportsUseCase initialized');
  }

  async execute(input: ListReportsInput): Promise<Output> {
    try {
      const reports = await this.repo.list(input);

      const sanitizedReports = reports.map((report) => ({
        id: report.id,
        reason: report.reason,
        isSolved: report.isSolved,
        description: report.description,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        reporterId: report.reporterId,
        reporter: {
          id: report.reporter.id,
          name: report.reporter.name,
          email: report.reporter.email,
        },
        product: report.product?.product ? {
          id: report.product.product.id,
          title: report.product.product.title,
          description: report.product.product.description,
          priceInCents: Number(report.product.product.priceInCents),
          stock: report.product.product.stock,
          slug: report.product.product.slug,
          viewsCount: report.product.product.viewsCount,
          likesCount: report.product.product.likesCount,
          categoryIds: report.product.product.categoryIds.map((id) => Number(id)),
          artisanId: report.product.product.artisanId,
        } : null,
      }));

      return right(sanitizedReports);
    } catch (err) {
      const error = err as Error;
      this.logger.error('Error listing reports', { error: error.message, input });
      return left(new Error('Internal server error'));
    }
  }
}
