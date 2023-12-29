export function textCenter(text: string, width: number): string {
  if (text.length > width) {
    throw new Error(
      `text must be shorter than ${width}, but was ${text.length}`
    );
  }

  const padding = " ".repeat(Math.ceil((width - text.length) / 2));

  return `${padding}${text}${padding}`.substring(0, width);
}

export const SpecialKeys = {
  backspace: "\u007f",
  delete: "\u001b[3~",
};

export interface TextEdit {
  text: string;
  cursorLocation: number;
}

export function textEditCreate(): TextEdit {
  return {
    text: "",
    cursorLocation: 0,
  };
}

export function textEditClear(edit: TextEdit) {
  edit.text = "";
  edit.cursorLocation = 0;
}

export function textEditMove(edit: TextEdit, location: number) {
  if (location < 0 || location > edit.text.length) {
    throw new Error(
      `location must be between 0 and ${edit.text.length}, but was ${location}`
    );
  }

  edit.cursorLocation = location;
}

export function textEditInput(edit: TextEdit, input: string) {
  switch (input) {
    case SpecialKeys.backspace:
      if (edit.cursorLocation > 0) {
        edit.text =
          edit.text.slice(0, edit.cursorLocation - 1) +
          edit.text.slice(edit.cursorLocation);
        edit.cursorLocation = edit.cursorLocation - 1;
      }
      break;

    case SpecialKeys.delete:
      if (edit.cursorLocation < edit.text.length) {
        edit.text =
          edit.text.slice(0, edit.cursorLocation) +
          edit.text.slice(edit.cursorLocation + 1);
        edit.cursorLocation = edit.cursorLocation;
      }
      break;

    default:
      edit.text =
        edit.text.slice(0, edit.cursorLocation) +
        input +
        edit.text.slice(edit.cursorLocation);
      edit.cursorLocation = edit.cursorLocation + input.length;
      break;
  }
}
