/**
 * Configuration options for railroad diagrams
 */

export interface OptionsConfig {
  DEBUG: boolean;
  VS: number;
  AR: number;
  DIAGRAM_CLASS: string;
  STROKE_ODD_PIXEL_LENGTH: boolean;
  INTERNAL_ALIGNMENT: 'left' | 'right' | 'center';
  CHAR_WIDTH: number;
  COMMENT_CHAR_WIDTH: number;
  ESCAPE_HTML: boolean;
  /** If false, CSS class attributes will not be added to SVG elements (for portable SVG) */
  USE_CSS_CLASSES: boolean;
}

export const Options: OptionsConfig = {
  DEBUG: false, // if true, writes some debug information into attributes
  VS: 8, // minimum vertical separation between things. For a 3px stroke, must be at least 4
  AR: 10, // radius of arcs
  DIAGRAM_CLASS: 'railroad-diagram', // class to put on the root <svg>
  STROKE_ODD_PIXEL_LENGTH: true, // is the stroke width an odd (1px, 3px, etc) pixel length?
  INTERNAL_ALIGNMENT: 'center', // how to align items when they have extra space. left/right/center
  CHAR_WIDTH: 8.5, // width of each monospace character. play until you find the right value for your font
  COMMENT_CHAR_WIDTH: 7, // comments are in smaller text by default
  ESCAPE_HTML: true, // Should Diagram.toText() produce HTML-escaped text, or raw?
  USE_CSS_CLASSES: true, // Add CSS class attributes to SVG elements
};

export const defaultCSS = ``; // CSS no longer needed; styles are inlined as SVG attributes

export interface StyleConfig {
  // Path defaults
  PATH_STROKE_WIDTH: number;
  PATH_STROKE: string;
  PATH_FILL: string;

  // Text defaults
  TEXT_FONT: string;
  TEXT_ANCHOR: string;
  TEXT_FILL: string;

  // Terminal text
  TERMINAL_FONT_FAMILY: string;

  // NonTerminal text
  NONTERMINAL_FONT_FAMILY: string;
  NONTERMINAL_FONT_WEIGHT: string;
  NONTERMINAL_FONT_STYLE: string;

  // Comment text
  COMMENT_FONT: string;

  // Diagram-text (label badges)
  DIAGRAM_TEXT_FONT_SIZE: string;
  DIAGRAM_ARROW_FONT_SIZE: string;
  LABEL_TEXT_ANCHOR: string;

  // Rect defaults
  RECT_STROKE_WIDTH: number;
  RECT_STROKE: string;
  RECT_FILL: string;

  // Group box rect
  GROUP_BOX_STROKE: string;
  GROUP_BOX_STROKE_DASHARRAY: string;
  GROUP_BOX_FILL: string;

  // Diagram-text path (badge shapes)
  DIAGRAM_TEXT_PATH_STROKE_WIDTH: number;
  DIAGRAM_TEXT_PATH_STROKE: string;
  DIAGRAM_TEXT_PATH_FILL: string;

  // SVG background
  SVG_BACKGROUND: string;
}

export const Style: StyleConfig = {
  // Path defaults
  PATH_STROKE_WIDTH: 2,
  PATH_STROKE: 'rgba(1, 1, 1, 0.8)',
  PATH_FILL: 'none',

  // Text defaults
  TEXT_FONT: 'bold 14px monospace',
  TEXT_ANCHOR: 'middle',
  TEXT_FILL: 'black',

  // Terminal text
  TERMINAL_FONT_FAMILY: 'Inconsolata, monospace',

  // NonTerminal text
  NONTERMINAL_FONT_FAMILY: '-apple-system, system-ui, sans-serif',
  NONTERMINAL_FONT_WEIGHT: '600',
  NONTERMINAL_FONT_STYLE: 'italic',

  // Comment text
  COMMENT_FONT: 'italic 12px monospace',

  // Diagram-text (label badges)
  DIAGRAM_TEXT_FONT_SIZE: '12px',
  DIAGRAM_ARROW_FONT_SIZE: '16px',
  LABEL_TEXT_ANCHOR: 'start',

  // Rect defaults
  RECT_STROKE_WIDTH: 1.5,
  RECT_STROKE: 'black',
  RECT_FILL: '#ffffff',

  // Group box rect
  GROUP_BOX_STROKE: 'gray',
  GROUP_BOX_STROKE_DASHARRAY: '10 5',
  GROUP_BOX_FILL: 'none',

  // Diagram-text path (badge shapes)
  DIAGRAM_TEXT_PATH_STROKE_WIDTH: 1.5,
  DIAGRAM_TEXT_PATH_STROKE: 'black',
  DIAGRAM_TEXT_PATH_FILL: 'white',

  // SVG background
  SVG_BACKGROUND: 'transparent',
};
