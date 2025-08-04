import React, { useRef, useEffect } from "react";

type AutoResizingTitleTextareaProps = {
	value: string;
	onChange: (value: string) => void;
	readOnly?: boolean;
	placeholder?: string;
	maxLength?: number;
	className?: string;
};

const AutoResizingTitleTextarea: React.FC<AutoResizingTitleTextareaProps> = ({
  value,
  onChange,
  placeholder = "Your moment title...",
  maxLength = 300,
  className = "",
  readOnly
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
		<textarea
			ref={textareaRef}
			placeholder={placeholder}
			className={`text-3xl font-libre font-semibold w-full min-h-fit h-fit resize-none text-wrap focus:outline-none px-10 pb-5 overflow-hidden ${className}`}
			value={value}
			maxLength={maxLength}
			rows={1}
			readOnly={readOnly}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
};

export default AutoResizingTitleTextarea; 