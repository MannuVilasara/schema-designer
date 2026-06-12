import React, { useCallback, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { useSchemaStore } from '@/store/schemaStore';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Trash2 } from 'lucide-react';

export default function StickyNoteNode({ data, id }: any) {
	const { isDark } = useThemeContext();
	const updateNote = useSchemaStore((state) => state.updateNote);
	const removeNote = useSchemaStore((state) => state.removeNote);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleTextChange = useCallback(
		(evt: React.ChangeEvent<HTMLTextAreaElement>) => {
			updateNote(id, evt.target.value);
		},
		[id, updateNote]
	);

	const handleDelete = useCallback(() => {
		removeNote(id);
	}, [id, removeNote]);

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [data.text]);

	return (
		<div
			className={`relative min-w-[200px] rounded-sm p-4 shadow-md transition-shadow hover:shadow-lg group ${
				isDark
					? 'bg-[#ffe4a0]/10 border border-[#ffe4a0]/20 text-[#ffe4a0]'
					: 'bg-[#fff7d1] border border-[#f5e6a1] text-[#8c7b30]'
			}`}
		>
			<button
				onClick={handleDelete}
				className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
			>
				<Trash2 className="w-3 h-3" />
			</button>
			<textarea
				ref={textareaRef}
				value={data.text}
				onChange={handleTextChange}
				className="w-full bg-transparent border-none outline-none resize-none font-medium text-sm leading-relaxed"
				placeholder="Type a note..."
				spellCheck={false}
				rows={1}
			/>
		</div>
	);
}
