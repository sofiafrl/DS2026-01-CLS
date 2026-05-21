export type TextInputState = {
	inputType: 'text';
	value: string;
};

export type FileInputState = {
	inputType: 'file';
};

export type InputState = TextInputState | FileInputState;
