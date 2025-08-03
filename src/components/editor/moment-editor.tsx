// components/editor/MomentEditor.tsx
 "use client";

import React, { useState, useRef, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { BulletList, ListItem } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import {
	Bold,
	Italic,
	List,
	Underline as UnderlineIcon,
	Highlighter,
	Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
    { name: "Red", value: "#f43f5e" },
    { name: "Orange", value: "#f97316" },
    { name: "Yellow", value: "#facc15" },
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a21caf" },
    { name: "Gray", value: "#6b7280" },
    { name: "Black", value: "#000000" },
];

export default function MomentEditor({
	initialContent,
	onChange,
	editorRef,
	readOnly = false,
}: {
	initialContent?: string;
	onChange?: (html: string) => void;
	editorRef?: React.MutableRefObject<any>;
	readOnly?: boolean;
}) {
	const [showColorPanel, setShowColorPanel] = useState(false);
	const colorPanelRef = useRef<HTMLDivElement>(null);
	const colorButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!showColorPanel) return;
		const handleClick = (e: MouseEvent) => {
			if (
				colorPanelRef.current &&
				!colorPanelRef.current.contains(e.target as Node) &&
				colorButtonRef.current &&
				!colorButtonRef.current.contains(e.target as Node)
			) {
				setShowColorPanel(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [ showColorPanel ] );
	
	console.log("Initial content:", initialContent);

	const editor = useEditor({
		extensions: [
			StarterKit,
			TextStyleKit,
			Color.configure({ types: ["textStyle"] }),
			Underline,
			Highlight,
			BulletList,
			ListItem,
			Placeholder.configure({
				placeholder: "Start typing your moment here...",
				emptyEditorClass: "is-editor-empty", // Class for empty editor
				emptyNodeClass: "is-node-empty", // Class for empty nodes
				showOnlyWhenEditable: false, // Show placeholder even in read-only mode
				showOnlyCurrent: false, // Show placeholder for all empty nodes
			}),
		],
		content: initialContent || "",
		editable: !readOnly,
		autofocus: !readOnly,
		onUpdate: ({ editor }) => {
			if (!readOnly) {
				onChange?.(editor.getHTML());
			}
		},
		immediatelyRender: false,
	});

	useEffect(() => {
		if (editor && editorRef) {
			editorRef.current = editor;
			requestAnimationFrame(() => {
				editor.commands.focus("end");
			});
		}
	}, [editor, editorRef]);

	if (!editor) return null;

	return (
		<div className='relative h-full'>
			{!readOnly && (
				<BubbleMenu
					editor={editor}
					className='flex gap-2 px-2 py-1 bg-white border shadow rounded-lg'
				>
					<button
						onClick={() => editor.chain().focus().toggleBold().run()}
						className={cn(
							"text-sm p-1 rounded hover:bg-gray-100",
							editor.isActive("bold") && "bg-gray-200 font-bold"
						)}
					>
						<Bold size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().toggleItalic().run()}
						className={cn(
							"text-sm p-1 rounded hover:bg-gray-100",
							editor.isActive("italic") && "bg-gray-200 italic"
						)}
					>
						<Italic size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className={cn(
							"text-sm p-1 rounded hover:bg-gray-100",
							editor.isActive("bulletList") && "bg-gray-200"
						)}
					>
						<List size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						className={cn(
							"text-sm p-1 rounded hover:bg-gray-100",
							editor.isActive("underline") && "bg-gray-200 underline"
						)}
					>
						<UnderlineIcon size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().toggleHighlight().run()}
						className={cn(
							"text-sm p-1 rounded hover:bg-gray-100",
							editor.isActive("highlight") && "bg-[#e8f3e8]"
						)}
					>
						<Highlighter size={16} />
					</button>
					<button
						ref={colorButtonRef}
						onClick={() => setShowColorPanel((v) => !v)}
						className={
							"text-sm p-1 rounded hover:bg-gray-100 text-gray-700 relative" +
							(editor.isActive("textStyle") &&
							editor.getAttributes("textStyle").color
								? " ring-2 ring-offset-1 ring-gray-300"
								: "")
						}
					>
						<Palette size={16} />
						{showColorPanel && (
							<div
								ref={colorPanelRef}
								className='absolute z-10 top-8 left-1/2 -translate-x-1/2 bg-white border shadow rounded p-2 flex gap-1 flex-wrap min-w-[160px]'
							>
								{COLORS.map((color) => (
									<div
										key={color.value}
										onClick={() => {
											editor.chain().focus().setColor(color.value).run();
											setShowColorPanel(false);
										}}
										style={{ backgroundColor: color.value }}
										className='w-6 h-6 rounded-full border-2 border-white hover:border-gray-300 focus:outline-none'
										aria-label={color.name}
									/>
								))}
							</div>
						)}
					</button>
				</BubbleMenu>
			)}

			<EditorContent
				editor={editor}
				className='prose prose-sm max-w-full text-base min-h-[300px] leading-7 flex-1 w-full resize-none outline-none focus:outline-none focus:ring-0 border-none pt-5 p-10'
			/>
		</div>
	);
}
