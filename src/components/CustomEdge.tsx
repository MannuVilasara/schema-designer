'use client';

import { useCallback } from 'react';
import {
	getSmoothStepPath,
	getBezierPath,
	EdgeProps,
	useReactFlow,
} from 'reactflow';

export default function CustomEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	data,
	markerEnd,
	pathOptions,
}: EdgeProps) {
	const { deleteElements } = useReactFlow();

	// Calculate path with offset for multiple connections
	const offset = pathOptions?.offset || 0;
	const borderRadius = pathOptions?.borderRadius || 20;
	const groupIndex = data?.groupIndex || 0;
	const totalInGroup = data?.totalInGroup || 1;

	let edgePath: string;

	if (totalInGroup > 1) {
		// For multiple connections, use bezier curves with control point offsets
		const controlOffset = offset * 0.8;
		const midX = (sourceX + targetX) / 2;
		const midY = (sourceY + targetY) / 2;

		// Create control points that curve around each other
		const controlX1 = midX + controlOffset;
		const controlY1 = sourceY + Math.abs(controlOffset) * 0.5;
		const controlX2 = midX + controlOffset;
		const controlY2 = targetY + Math.abs(controlOffset) * 0.5;

		[edgePath] = getBezierPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition,
			curvature: 0.25 + Math.abs(offset) * 0.01,
		});
	} else {
		// For single connections, use smooth step
		[edgePath] = getSmoothStepPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition,
			borderRadius: borderRadius,
		});
	}

	const onEdgeClick = useCallback(() => {
		deleteElements({ edges: [{ id }] });
	}, [id, deleteElements]);

	return (
		<>
			<path
				id={id}
				style={{
					...style,
					strokeDasharray:
						totalInGroup > 1 && groupIndex > 0 ? '5,5' : 'none',
				}}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd={markerEnd}
			/>
			<path
				d={edgePath}
				fill="none"
				strokeOpacity={0}
				strokeWidth={20}
				className="react-flow__edge-interaction"
				onClick={onEdgeClick}
			/>
			{/* Add small indicator for grouped connections */}
			{totalInGroup > 1 && groupIndex === 0 && (
				<text
					x={sourceX + (targetX - sourceX) * 0.1}
					y={sourceY + (targetY - sourceY) * 0.1}
					className="react-flow__edge-text"
					style={{
						fontSize: '10px',
						fill: style.stroke,
						fontWeight: 'bold',
						textAnchor: 'middle',
					}}
				>
					{totalInGroup}
				</text>
			)}
		</>
	);
}
