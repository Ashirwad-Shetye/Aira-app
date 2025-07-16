// components/editor/MomentEditor.tsx
"use client";

import { EditorContent, useEditor } from "@tiptap/react";
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

export default function MomentEditor({
	initialContent,
	onChange,
}: {
	initialContent?: string;
	onChange?: (html: string) => void;
}) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			TextStyleKit,
			Color.configure({ types: ["textStyle"] }),
			Underline,
			Highlight,
		],
		content: initialContent || "",
		autofocus: true,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		},
		immediatelyRender: false,
	});

	if (!editor) return null;

	return (
		<div className='relative h-full overflow-y-auto'>
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
						editor.isActive("highlight") && "bg-yellow-200"
					)}
				>
					<Highlighter size={16} />
				</button>
				<button
					onClick={() => editor.chain().focus().setColor("#f43f5e").run()}
					className='text-sm p-1 rounded hover:bg-rose-100 text-rose-600'
				>
					<Palette size={16} />
				</button>
			</BubbleMenu>
			<EditorContent
				editor={editor}
				className='prose prose-sm max-w-full text-base min-h-[300px] leading-7 flex-1 w-full resize-none outline-none focus:outline-none focus:ring-0 border-none'
			/>
		</div>
	);
}
