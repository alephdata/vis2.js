import { withTranslator } from '../Translator';

import Count from './Count';
import Country from './Country';
import DateBase from './Date';
import Entity from './Entity';
import FileSize from './FileSize';
import Language from './Language';
import NumericBase from './Numeric';
import Schema from './Schema';
import Topic from './Topic';
import URL from './URL';

const Date = withTranslator(DateBase);
const Numeric = withTranslator(NumericBase);

export * from './Property';

export {
  Count,
  Country,
  Date,
  Entity,
  FileSize,
  Language,
  Numeric,
  Schema,
  Topic,
  URL,
};
