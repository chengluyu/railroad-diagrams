import { Options } from '../config.js';

/**
 * TextDiagram is used for rendering diagrams as text/ASCII art
 */
export class TextDiagram {
  entry: number;
  exit: number;
  height: number;
  width: number;
  lines: string[];

  constructor(entry: number, exit: number, lines: string[]) {
    this.entry = entry;
    this.exit = exit;
    this.height = lines.length;
    this.lines = Array.from(lines);
    this.width = lines.length > 0 ? lines[0].length : 0;

    if (entry > lines.length) {
      throw new Error('Entry is not within diagram vertically:\n' + this._dump(false));
    }
    if (exit > lines.length) {
      throw new Error('Exit is not within diagram vertically:\n' + this._dump(false));
    }
    for (let i = 0; i < lines.length; i++) {
      if (lines[0].length !== lines[i].length) {
        throw new Error('Diagram data is not rectangular:\n' + this._dump(false));
      }
    }
  }

  /**
   * Create and return a new TextDiagram based on this instance, with the specified changes.
   */
  alter(entry: number | null = null, exit: number | null = null, lines: string[] | null = null): TextDiagram {
    const newEntry = entry ?? this.entry;
    const newExit = exit ?? this.exit;
    const newLines = lines ?? this.lines;
    return new TextDiagram(newEntry, newExit, Array.from(newLines));
  }

  /**
   * Create and return a new TextDiagram by appending the specified lines below this instance's data,
   * and then appending the specified TextDiagram below those lines.
   */
  appendBelow(
    item: TextDiagram,
    linesBetween: string[],
    moveEntry: boolean = false,
    moveExit: boolean = false
  ): TextDiagram {
    const newWidth = Math.max(this.width, item.width);
    const newLines: string[] = [];
    let centeredLines = this.center(newWidth, ' ').lines;
    for (const line of centeredLines) {
      newLines.push(line);
    }
    for (const line of linesBetween) {
      newLines.push(TextDiagram._padR(line, newWidth, ' '));
    }
    centeredLines = item.center(newWidth, ' ').lines;
    for (const line of centeredLines) {
      newLines.push(line);
    }
    const newEntry = moveEntry ? this.height + linesBetween.length + item.entry : this.entry;
    const newExit = moveExit ? this.height + linesBetween.length + item.exit : this.exit;
    return new TextDiagram(newEntry, newExit, newLines);
  }

  /**
   * Create and return a new TextDiagram by appending the specified TextDiagram to the right of this instance's data,
   * aligning the left-hand exit and the right-hand entry points.
   */
  appendRight(item: TextDiagram, charsBetween: string): TextDiagram {
    const joinLine = Math.max(this.exit, item.entry);
    const newHeight = Math.max(this.height - this.exit, item.height - item.entry) + joinLine;
    const leftTopAdd = joinLine - this.exit;
    const leftBotAdd = newHeight - this.height - leftTopAdd;
    const rightTopAdd = joinLine - item.entry;
    const rightBotAdd = newHeight - item.height - rightTopAdd;
    const left = this.expand(0, 0, leftTopAdd, leftBotAdd);
    const right = item.expand(0, 0, rightTopAdd, rightBotAdd);
    const newLines: string[] = [];
    for (let i = 0; i < newHeight; i++) {
      const sep = i !== joinLine ? ' '.repeat(charsBetween.length) : charsBetween;
      newLines.push(left.lines[i] + sep + right.lines[i]);
    }
    const newEntry = this.entry + leftTopAdd;
    const newExit = item.exit + rightTopAdd;
    return new TextDiagram(newEntry, newExit, newLines);
  }

  /**
   * Create and return a new TextDiagram by centering the data of this instance within a new, equal or larger width.
   */
  center(width: number, pad: string): TextDiagram {
    if (width < this.width) {
      throw new Error('Cannot center into smaller width');
    }
    if (width === this.width) {
      return this.copy();
    } else {
      const totalPadding = width - this.width;
      const leftWidth = Math.trunc(totalPadding / 2);
      const left: string[] = [];
      for (let i = 0; i < this.height; i++) {
        left.push(pad.repeat(leftWidth));
      }
      const right: string[] = [];
      for (let i = 0; i < this.height; i++) {
        right.push(pad.repeat(totalPadding - leftWidth));
      }
      return new TextDiagram(this.entry, this.exit, TextDiagram._encloseLines(this.lines, left, right));
    }
  }

  /**
   * Create and return a new TextDiagram by copying this instance's data.
   */
  copy(): TextDiagram {
    return new TextDiagram(this.entry, this.exit, Array.from(this.lines));
  }

  /**
   * Create and return a new TextDiagram by expanding this instance's data by the specified amount in the specified directions.
   */
  expand(left: number, right: number, top: number, bottom: number): TextDiagram {
    if (left < 0 || right < 0 || top < 0 || bottom < 0) {
      throw new Error('Expansion values cannot be negative');
    }
    if (left + right + top + bottom === 0) {
      return this.copy();
    } else {
      const line = TextDiagram.parts['line'];
      const newLines: string[] = [];
      for (let i = 0; i < top; i++) {
        newLines.push(' '.repeat(this.width + left + right));
      }
      for (let i = 0; i < this.height; i++) {
        const leftExpansion = i === this.entry ? line : ' ';
        const rightExpansion = i === this.exit ? line : ' ';
        newLines.push(leftExpansion.repeat(left) + this.lines[i] + rightExpansion.repeat(right));
      }
      for (let i = 0; i < bottom; i++) {
        newLines.push(' '.repeat(this.width + left + right));
      }
      return new TextDiagram(this.entry + top, this.exit + top, newLines);
    }
  }

  /**
   * Create and return a new TextDiagram for a rectangular box.
   */
  static rect(item: TextDiagram | string, dashed: boolean = false): TextDiagram {
    return TextDiagram._rectish('rect', item, dashed);
  }

  /**
   * Create and return a new TextDiagram for a rectangular box with rounded corners.
   */
  static roundrect(item: TextDiagram | string, dashed: boolean = false): TextDiagram {
    return TextDiagram._rectish('roundrect', item, dashed);
  }

  /**
   * Set the characters to use for drawing text diagrams.
   */
  static setFormatting(characters: Record<string, string> | null = null, defaults: Record<string, string> | null = null): void {
    if (characters !== null) {
      TextDiagram.parts = {};
      if (defaults !== null) {
        TextDiagram.parts = { ...TextDiagram.parts, ...defaults };
      }
      TextDiagram.parts = { ...TextDiagram.parts, ...characters };
    }
    for (const [name, value] of Object.entries(TextDiagram.parts)) {
      if (value.length !== 1) {
        throw new Error('Text part ' + name + ' is more than 1 character: ' + value);
      }
    }
  }

  /**
   * Dump out the data of this instance for debugging
   */
  _dump(show: boolean = true): string {
    const nl = '\n';
    let result = 'height=' + this.height + ' lines.length=' + this.lines.length;
    if (this.entry > this.lines.length) {
      result += '; entry outside diagram: entry=' + this.entry;
    }
    if (this.exit > this.lines.length) {
      result += '; exit outside diagram: exit=' + this.exit;
    }
    for (let y = 0; y < Math.max(this.lines.length, this.entry + 1, this.exit + 1); y++) {
      result = result + nl + '[' + ('00' + y).slice(-3) + ']';
      if (y < this.lines.length) {
        result += " '" + this.lines[y] + "' len=" + this.lines[y].length;
      }
      if (y === this.entry && y === this.exit) {
        result += ' <- entry, exit';
      } else if (y === this.entry) {
        result += ' <- entry';
      } else if (y === this.exit) {
        result += ' <- exit';
      }
    }
    if (show) {
      console.log(result);
    }
    return result;
  }

  /**
   * Join the lefts, lines, and rights arrays together, line-by-line, and return the result.
   */
  static _encloseLines(lines: string[], lefts: string[], rights: string[]): string[] {
    if (lines.length !== lefts.length) {
      throw new Error('All arguments must be the same length');
    }
    if (lines.length !== rights.length) {
      throw new Error('All arguments must be the same length');
    }
    const newLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      newLines.push(lefts[i] + lines[i] + rights[i]);
    }
    return newLines;
  }

  /**
   * Return the left and right pad spacing based on the alignment configuration setting.
   */
  static _gaps(outerWidth: number, innerWidth: number, alignment?: 'left' | 'right' | 'center'): [number, number] {
    const diff = outerWidth - innerWidth;
    const align = alignment ?? Options.INTERNAL_ALIGNMENT;
    if (align === 'left') {
      return [0, diff];
    } else if (align === 'right') {
      return [diff, 0];
    } else {
      const left = Math.trunc(diff / 2);
      const right = diff - left;
      return [left, right];
    }
  }

  /**
   * Return a list of text diagram drawing characters for the specified character names.
   */
  static _getParts(partNames: string[]): string[] {
    const result: string[] = [];
    for (const name of partNames) {
      if (TextDiagram.parts[name] === undefined) {
        throw new Error('Text diagram part ' + name + ' not found.');
      }
      result.push(TextDiagram.parts[name]);
    }
    return result;
  }

  /**
   * Return the maximum width of all of the arguments.
   */
  static _maxWidth(...args: unknown[]): number {
    let maxWidth = 0;
    for (const arg of args) {
      let width: number;
      if (arg instanceof TextDiagram) {
        width = arg.width;
      } else if (Array.isArray(arg)) {
        width = Math.max(...(arg as string[]).map((e) => e.length));
      } else if (typeof arg === 'number') {
        width = arg.toString().length;
      } else if (typeof arg === 'string') {
        width = arg.length;
      } else {
        width = String(arg).length;
      }
      maxWidth = width > maxWidth ? width : maxWidth;
    }
    return maxWidth;
  }

  /**
   * Pad the specified string on the left to the specified width with the specified pad string and return the result.
   */
  static _padL(string: string, width: number, pad: string): string {
    if ((width - string.length) % pad.length !== 0) {
      throw new Error("Gap " + (width - string.length) + " must be a multiple of pad string '" + pad + "'");
    }
    return pad.repeat(Math.trunc((width - string.length) / pad.length)) + string;
  }

  /**
   * Pad the specified string on the right to the specified width with the specified pad string and return the result.
   */
  static _padR(string: string, width: number, pad: string): string {
    if ((width - string.length) % pad.length !== 0) {
      throw new Error("Gap " + (width - string.length) + " must be a multiple of pad string '" + pad + "'");
    }
    return string + pad.repeat(Math.trunc((width - string.length) / pad.length));
  }

  /**
   * Create and return a new TextDiagram for a rectangular box surrounding the specified TextDiagram.
   */
  static _rectish(rectType: string, data: TextDiagram | string, dashed: boolean = false): TextDiagram {
    const lineType = dashed ? '_dashed' : '';
    const [
      topLeft,
      ctrLeft,
      botLeft,
      topRight,
      ctrRight,
      botRight,
      topHoriz,
      botHoriz,
      line,
      cross,
    ] = TextDiagram._getParts([
      rectType + '_top_left',
      rectType + '_left' + lineType,
      rectType + '_bot_left',
      rectType + '_top_right',
      rectType + '_right' + lineType,
      rectType + '_bot_right',
      rectType + '_top' + lineType,
      rectType + '_bot' + lineType,
      'line',
      'cross',
    ]);
    const itemWasFormatted = data instanceof TextDiagram;
    let itemTD: TextDiagram;
    if (itemWasFormatted) {
      itemTD = data;
    } else {
      itemTD = new TextDiagram(0, 0, [data as string]);
    }
    // Create the rectangle and enclose the item in it.
    const lines: string[] = [];
    lines.push(topHoriz.repeat(itemTD.width + 2));
    if (itemWasFormatted) {
      const expanded = itemTD.expand(1, 1, 0, 0);
      lines.push(...expanded.lines);
    } else {
      for (let i = 0; i < itemTD.lines.length; i++) {
        lines.push(' ' + itemTD.lines[i] + ' ');
      }
    }
    lines.push(botHoriz.repeat(itemTD.width + 2));
    const entry = itemTD.entry + 1;
    const exit = itemTD.exit + 1;
    const leftMaxWidth = TextDiagram._maxWidth(topLeft, ctrLeft, botLeft);
    const lefts: string[] = [];
    lefts.push(TextDiagram._padR(topLeft, leftMaxWidth, topHoriz));
    for (let i = 1; i < lines.length - 1; i++) {
      lefts.push(TextDiagram._padR(ctrLeft, leftMaxWidth, ' '));
    }
    lefts.push(TextDiagram._padR(botLeft, leftMaxWidth, botHoriz));
    if (itemWasFormatted) {
      lefts[entry] = cross;
    }
    const rightMaxWidth = TextDiagram._maxWidth(topRight, ctrRight, botRight);
    const rights: string[] = [];
    rights.push(TextDiagram._padL(topRight, rightMaxWidth, topHoriz));
    for (let i = 1; i < lines.length - 1; i++) {
      rights.push(TextDiagram._padL(ctrRight, rightMaxWidth, ' '));
    }
    rights.push(TextDiagram._padL(botRight, rightMaxWidth, botHoriz));
    if (itemWasFormatted) {
      rights[exit] = cross;
    }
    // Build the entry and exit perimeter.
    let resultLines = TextDiagram._encloseLines(lines, lefts, rights);
    lefts.length = 0;
    for (let i = 0; i < resultLines.length; i++) {
      lefts.push(' ');
    }
    lefts[entry] = line;
    rights.length = 0;
    for (let i = 0; i < resultLines.length; i++) {
      rights.push(' ');
    }
    rights[exit] = line;
    resultLines = TextDiagram._encloseLines(resultLines, lefts, rights);
    return new TextDiagram(entry, exit, resultLines);
  }

  // Note: All the drawing sequences below MUST be single characters. setFormatting() checks this.
  // Unicode 25xx box drawing characters, plus a few others.
  static PARTS_UNICODE: Record<string, string> = {
    cross_diag: '\u2573',
    corner_bot_left: '\u2514',
    corner_bot_right: '\u2518',
    corner_top_left: '\u250c',
    corner_top_right: '\u2510',
    cross: '\u253c',
    left: '\u2502',
    line: '\u2500',
    line_vertical: '\u2502',
    multi_repeat: '\u21ba',
    rect_bot: '\u2500',
    rect_bot_dashed: '\u2504',
    rect_bot_left: '\u2514',
    rect_bot_right: '\u2518',
    rect_left: '\u2502',
    rect_left_dashed: '\u2506',
    rect_right: '\u2502',
    rect_right_dashed: '\u2506',
    rect_top: '\u2500',
    rect_top_dashed: '\u2504',
    rect_top_left: '\u250c',
    rect_top_right: '\u2510',
    repeat_bot_left: '\u2570',
    repeat_bot_right: '\u256f',
    repeat_left: '\u2502',
    repeat_right: '\u2502',
    repeat_top_left: '\u256d',
    repeat_top_right: '\u256e',
    right: '\u2502',
    roundcorner_bot_left: '\u2570',
    roundcorner_bot_right: '\u256f',
    roundcorner_top_left: '\u256d',
    roundcorner_top_right: '\u256e',
    roundrect_bot: '\u2500',
    roundrect_bot_dashed: '\u2504',
    roundrect_bot_left: '\u2570',
    roundrect_bot_right: '\u256f',
    roundrect_left: '\u2502',
    roundrect_left_dashed: '\u2506',
    roundrect_right: '\u2502',
    roundrect_right_dashed: '\u2506',
    roundrect_top: '\u2500',
    roundrect_top_dashed: '\u2504',
    roundrect_top_left: '\u256d',
    roundrect_top_right: '\u256e',
    separator: '\u2500',
    tee_left: '\u2524',
    tee_right: '\u251c',
  };

  // Plain old ASCII characters.
  static PARTS_ASCII: Record<string, string> = {
    cross_diag: 'X',
    corner_bot_left: '\\',
    corner_bot_right: '/',
    corner_top_left: '/',
    corner_top_right: '\\',
    cross: '+',
    left: '|',
    line: '-',
    line_vertical: '|',
    multi_repeat: '&',
    rect_bot: '-',
    rect_bot_dashed: '-',
    rect_bot_left: '+',
    rect_bot_right: '+',
    rect_left: '|',
    rect_left_dashed: '|',
    rect_right: '|',
    rect_right_dashed: '|',
    rect_top_dashed: '-',
    rect_top: '-',
    rect_top_left: '+',
    rect_top_right: '+',
    repeat_bot_left: '\\',
    repeat_bot_right: '/',
    repeat_left: '|',
    repeat_right: '|',
    repeat_top_left: '/',
    repeat_top_right: '\\',
    right: '|',
    roundcorner_bot_left: '\\',
    roundcorner_bot_right: '/',
    roundcorner_top_left: '/',
    roundcorner_top_right: '\\',
    roundrect_bot: '-',
    roundrect_bot_dashed: '-',
    roundrect_bot_left: '\\',
    roundrect_bot_right: '/',
    roundrect_left: '|',
    roundrect_left_dashed: '|',
    roundrect_right: '|',
    roundrect_right_dashed: '|',
    roundrect_top: '-',
    roundrect_top_dashed: '-',
    roundrect_top_left: '/',
    roundrect_top_right: '\\',
    separator: '-',
    tee_left: '|',
    tee_right: '|',
  };

  // Characters to use in drawing diagrams. See setFormatting(), PARTS_ASCII, and PARTS_UNICODE.
  static parts: Record<string, string> = TextDiagram.PARTS_UNICODE;
}
