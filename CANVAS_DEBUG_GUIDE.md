# Canvas Debugging Guide

## Current Debug Setup

I've added several debugging features to help identify the canvas visibility issue:

### 1. Visual Debug Elements

#### **Container Borders**
- **Red border**: Around the main canvas container
- **Blue border**: Around the flex container  
- **Green border**: Around the absolute positioned container

#### **Debug Overlay**
- **Position**: Top-left corner of the canvas
- **Shows**: Collection count, node count, edge count
- **Test Button**: "Add Test Collection" button to create sample data

### 2. Console Logging

The canvas now logs debug information to the browser console:
```javascript
console.log('Canvas Debug:', {
  collections: collections.length,
  nodes: nodes.length,
  edges: edges.length,
  isDark,
});
```

### 3. Test Collection Creation

- The canvas will automatically create a test collection if none exist
- Manual test button available in the debug overlay
- Each test collection includes timestamps and basic fields

## What You Should See

### When the App Loads:

1. **Debug Overlay**: A white box in the top-left showing:
   ```
   Debug: 1 collections, 1 nodes, 0 edges
   [Add Test Collection]
   ```

2. **Visual Borders**: 
   - Red border around the canvas area
   - Blue border around the container
   - Green border around the inner container

3. **Canvas Background**: 
   - Light mode: Light gray background (`#f8fafc`)
   - Dark mode: Dark background (`#0f172a`)

4. **ReactFlow Elements**:
   - Background grid pattern
   - Zoom controls in bottom-left corner
   - Collection node(s) if data exists

### Troubleshooting Steps

#### **Step 1: Check Container Visibility**
- Can you see the colored borders (red, blue, green)?
- If NO: Layout issue - containers have no height
- If YES: ReactFlow rendering issue

#### **Step 2: Check Debug Overlay**
- Is the debug overlay visible in the top-left?
- If NO: JavaScript/React rendering issue
- If YES: ReactFlow specifically not rendering

#### **Step 3: Check Browser Console**
- Open browser dev tools (F12)
- Look for "Canvas Debug:" messages
- Check for any error messages

#### **Step 4: Test Collection Creation**
- Click "Add Test Collection" button
- Watch debug numbers change
- Check if collection nodes appear

## Common Issues & Solutions

### Issue 1: No Colored Borders Visible
**Problem**: Layout containers have no height
**Solution**: Check CSS height inheritance chain

### Issue 2: Debug Overlay Visible But No Canvas
**Problem**: ReactFlow not rendering
**Possible Causes**:
- Missing ReactFlow CSS imports
- ReactFlow version compatibility
- Node type registration issues

### Issue 3: Canvas Visible But No Nodes
**Problem**: Node rendering issue
**Check**: 
- Node type registration matches usage
- Node data structure is correct
- CollectionNode component is working

### Issue 4: Canvas Behind Other Elements
**Problem**: Z-index or layout stacking
**Solution**: Check if other elements are covering the canvas

## Test Commands

Run these in your browser console:

```javascript
// Check ReactFlow state
console.log('ReactFlow nodes:', nodes);
console.log('ReactFlow edges:', edges);

// Check store state
console.log('Store collections:', useSchemaStore.getState().collections);

// Force re-render
window.location.reload();
```

## Next Steps

1. **Run the app**: `pnpm dev`
2. **Navigate to**: `/designer`
3. **Check what you see** against the "What You Should See" section
4. **Report back**: Which elements are visible and which are not

This will help us identify the exact issue and create a targeted fix.

## Temporary Debug Features

These debug features will be removed once the issue is resolved:
- [ ] Red/blue/green borders
- [ ] Debug overlay
- [ ] Console logging
- [ ] Auto test collection creation
- [ ] Dock component temporarily disabled