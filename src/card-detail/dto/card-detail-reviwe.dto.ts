import { PickType } from '@nestjs/swagger';
import { CardDetail } from '../entities/card-detail.entity';

export class CardDetailReviewDto extends PickType(CardDetail, ['reviewText']) {}
