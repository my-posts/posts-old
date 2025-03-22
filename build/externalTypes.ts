import {
  PostAttribute,
  Post as ThemeLibPost,
  TocItem,
} from '@mjy-blog/theme-lib';

export interface CorePost<T extends PostAttribute> extends ThemeLibPost<T> {
  path: string;
  tocItems: TocItem[];
}
