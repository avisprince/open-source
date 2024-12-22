/*
# echomd -- An md like conversion tool for shell terminals
#
# Fully inspired by the work of John Gruber
# <http://daringfireball.net/projects/markdown/>
#
# ────────────────────────────────────────────────────────────────────────
# The MIT License (MIT)
# Copyright (c) 2016 Andrea Giammarchi - @WebReflection
#
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom
# the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
# DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
# THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
# ────────────────────────────────────────────────────────────────────────
*/

const line = Array(73).join('─');

function echomd(txt?: string) {
  if (!txt) {
    return '';
  }

  // horizontal
  txt = txt.replace(
    /^[ ]{0,2}([ ]?[*_-][ ]?){3,}[ \t]*$/gm,
    '\x1B[1m' + line + '\x1B[22m',
  );
  // header
  txt = txt.replace(/^(\#{1,6})[ \t]+(.+?)[ \t]*\#*([\r\n]+|$)/gm, getHeader);
  // bold dim underline blink reverse hidden strike
  txt = txt.replace(/(\*{1,2})(?=\S)(.*?)(\S)\1/g, '\x1B[1m$2$3\x1B[22m');
  txt = txt.replace(/(_{1,2})(?=\S)(.*?)(\S)\1/g, '\x1B[4m$2$3\x1B[24m');
  txt = txt.replace(
    /(\:{1,2})(?=\S)(.*?)(\S)\1/g,
    '\x1B[5m' + '$2' + '$3' + '\x1B[25m',
  );
  txt = txt.replace(/(\!{1,2})(?=\S)(.*?)(\S)\1/g, '\x1B[7m$2$3\x1B[27m');
  txt = txt.replace(/(\?{1,2})(?=\S)(.*?)(\S)\1/g, '\x1B[8m$2$3\x1B[28m');
  txt = txt.replace(/(~{1,2})(?=\S)(.*?)(\S)\1/g, '\x1B[9m$2$3\x1B[29m');
  // list
  txt = txt.replace(/^([ \t]{1,})[*+-]([ \t]{1,})/gm, '$1•$2');
  // quote
  txt = txt.replace(/^[ \t]*>([ \t]?)/gm, '\x1B[7m$1\x1B[27m$1');
  // color
  txt = txt.replace(/(!?)#([a-zA-Z0-9]{3,8})\((.+?)\)(?!\))/g, getColor);
  return txt;
}

// HELPERS

function Dict() {}
Dict.has = function has(dict: unknown, property: string) {
  return Object.prototype.hasOwnProperty.call(dict, property);
};
Dict.prototype = Object.create(null);

function getColor(_$0: string, bg: string, rgb: string, txt: string) {
  let out = '';
  switch (rgb) {
    case 'black':
      out = '\x1B[30m';
      break;
    case 'red':
      out = '\x1B[31m';
      break;
    case 'green':
      out = '\x1B[32m';
      break;
    case 'blue':
      out = '\x1B[34m';
      break;
    case 'magenta':
      out = '\x1B[35m';
      break;
    case 'cyan':
      out = '\x1B[36m';
      break;
    case 'white':
      out = '\x1B[37m';
      break;
    case 'yellow':
      out = '\x1B[39m';
      break;
    case 'grey':
      out = '\x1B[90m';
      break;
  }
  out += out === '' ? txt : txt + '\x1B[39m';
  return bg === '' ? out : '\x1B[7m' + out + '\x1B[27m';
}

function getHeader(_$0: string, $1: string, $2: string, $3: string) {
  if ($1.length === 1) {
    $2 = '\x1B[1m' + $2 + '\x1B[22m';
  }
  return '\x1B[7m ' + $2 + ' \x1B[27m' + $3;
}

export default echomd;
