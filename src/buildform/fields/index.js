// Field-type registry: maps a schema field type to its factory.
// Factories return { element, getValue, isAttachment? }.
//
// Note: the spec suggested one file per field type. We grouped trivially
// similar inputs (text/number/date...) into inputs.js to stay solo-maintainable
// — twelve near-identical one-liner files would be noise, not clarity. The
// distinct behaviours (choice, upload, signature) each get their own file.

import * as inputs from './inputs.js';
import * as choice from './choice.js';
import * as upload from './upload.js';
import { signature } from './signature.js';

export const FIELD_FACTORIES = {
  text: inputs.text,
  textarea: inputs.textarea,
  number: inputs.number,
  checkbox: inputs.checkbox,
  date: inputs.date,
  time: inputs.time,
  datetime: inputs.datetime,
  select: choice.select,
  multiselect: choice.multiselect,
  image: upload.image,
  file: upload.file,
  signature,
};
