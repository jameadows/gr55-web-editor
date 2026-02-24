# Remaining Component Specs

Build these components with your IDE using the Knob component as a reference pattern.

---

## 1. Slider Component

### File: `src/app/shared/components/slider/slider.component.ts`

**Purpose:** Horizontal or vertical fader control

**Similar to:** Knob, but linear instead of rotary

**Inputs:**
```typescript
@Input() value: number = 0;
@Input() min: number = 0;
@Input() max: number = 127;
@Input() label: string = '';
@Input() units: string = '';
@Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
@Input() width: number = 200;   // For horizontal
@Input() height: number = 30;   // For horizontal
@Input() disabled: boolean = false;
@Input() step: number = 1;
@Input() color: 'amber' | 'green' | 'cyan' | 'red' = 'amber';
```

**Outputs:**
```typescript
@Output() valueChange = new EventEmitter<number>();
```

**Implementation Notes:**

**Structure (Horizontal):**
```html
<div class="slider-container">
  <div class="slider-track">
    <!-- Background track -->
    <div class="slider-track-bg"></div>
    
    <!-- Filled portion (shows current value) -->
    <div class="slider-track-fill" [style.width.%]="percentage()"></div>
    
    <!-- Draggable thumb -->
    <div class="slider-thumb" 
         [style.left.%]="percentage()"
         (mousedown)="onMouseDown($event)">
    </div>
  </div>
  
  <!-- Value display -->
  <div class="slider-value">{{ displayValue() }}</div>
  
  <!-- Label -->
  <div class="slider-label">{{ label }}</div>
</div>
```

**For Vertical:**
- Swap width/height
- Use bottom instead of left for positioning
- Invert mouse Y calculation

**Mouse Interaction:**
```typescript
onMouseMove(event: MouseEvent) {
  const rect = trackElement.getBoundingClientRect();
  
  if (orientation === 'horizontal') {
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newValue = min + (percentage * (max - min));
  } else {
    const y = event.clientY - rect.top;
    const percentage = 1 - (y / rect.height); // Inverted for vertical
    const newValue = min + (percentage * (max - min));
  }
  
  // Clamp and step
  const clamped = Math.max(min, Math.min(max, newValue));
  const stepped = Math.round(clamped / step) * step;
  
  this.valueChange.emit(stepped);
}
```

**Computed Values:**
```typescript
percentage = computed(() => {
  return ((value - min) / (max - min)) * 100;
});

displayValue = computed(() => {
  return units ? `${value}${units}` : value.toString();
});
```

**Styling:**
- Track: 4px tall (horizontal) or 4px wide (vertical)
- Thumb: 16px circle
- Fill color: Use color theme
- Hover effect on thumb
- Smooth transitions

---

## 2. Dropdown Component

### File: `src/app/shared/components/dropdown/dropdown.component.ts`

**Purpose:** Select from enum values (MFX types, modes, etc.)

**Inputs:**
```typescript
@Input() value: number = 0;              // Selected index
@Input() options: string[] = [];         // Option labels
@Input() label: string = '';
@Input() disabled: boolean = false;
@Input() color: 'amber' | 'green' | 'cyan' | 'red' = 'amber';
```

**Outputs:**
```typescript
@Output() valueChange = new EventEmitter<number>();
```

**Implementation Notes:**

**Structure:**
```html
<div class="dropdown-container">
  <label class="dropdown-label">{{ label }}</label>
  
  <select 
    class="dropdown-select"
    [class]="colorClass()"
    [disabled]="disabled"
    [value]="value"
    (change)="onChange($event)">
    
    @for (option of options; track $index) {
      <option [value]="$index">{{ option }}</option>
    }
  </select>
</div>
```

**onChange Handler:**
```typescript
onChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const newValue = parseInt(target.value, 10);
  this.valueChange.emit(newValue);
}
```

**Styling:**
- Match dark terminal theme
- Custom arrow (▼) using CSS
- Hover effect
- Color theme for border/text
- Disabled state (opacity 0.4)

**CSS Pattern:**
```css
.dropdown-select {
  background: var(--bg-field);
  border: 2px solid currentColor;
  color: currentColor;
  font-family: 'Courier New', monospace;
  padding: 8px 12px;
  appearance: none; /* Remove default arrow */
}

/* Custom arrow */
.dropdown-container::after {
  content: '▼';
  position: absolute;
  right: 12px;
  pointer-events: none;
}
```

---

## 3. LED Indicator Component

### File: `src/app/shared/components/led/led.component.ts`

**Purpose:** Show on/off state (switch parameters, effect enables)

**Inputs:**
```typescript
@Input() isOn: boolean = false;
@Input() label: string = '';
@Input() size: number = 12;  // LED diameter
@Input() color: 'amber' | 'green' | 'cyan' | 'red' = 'green';
```

**Outputs:**
```typescript
@Output() toggle = new EventEmitter<boolean>();  // If clickable
```

**Implementation Notes:**

**Structure:**
```html
<div class="led-container" (click)="onToggle()">
  <div class="led-indicator"
       [class.on]="isOn"
       [class]="colorClass()"
       [style.width.px]="size"
       [style.height.px]="size">
  </div>
  <span class="led-label">{{ label }}</span>
</div>
```

**Styling:**
```css
.led-indicator {
  border-radius: 50%;
  background: #2a2a2a;
  border: 2px solid currentColor;
  opacity: 0.3;
  transition: all 0.2s;
}

.led-indicator.on {
  opacity: 1;
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
}

/* Pulsing animation for active LED */
.led-indicator.on {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

**Toggle Handler:**
```typescript
onToggle() {
  this.toggle.emit(!this.isOn);
}
```

---

## 4. Parameter Label Component

### File: `src/app/shared/components/parameter-label/parameter-label.component.ts`

**Purpose:** Display parameter name and current value (read-only display)

**Inputs:**
```typescript
@Input() label: string = '';
@Input() value: string | number = '';
@Input() units: string = '';
@Input() color: 'amber' | 'green' | 'cyan' | 'red' | 'default' = 'default';
```

**Implementation Notes:**

**Structure:**
```html
<div class="param-label-container">
  <span class="param-name">{{ label }}</span>
  <span class="param-value" [class]="colorClass()">
    {{ displayValue() }}
  </span>
</div>
```

**Computed Value:**
```typescript
displayValue = computed(() => {
  if (typeof value === 'string') return value;
  return units ? `${value}${units}` : value.toString();
});

colorClass = computed(() => `value-${color}`);
```

**Styling:**
```css
.param-label-container {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #1e2820;
  font-family: 'Courier New', monospace;
}

.param-name {
  color: #6c757d;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
}

.param-value {
  font-weight: 600;
}

.value-amber { color: #e8a020; }
.value-green { color: #3ddc6a; }
.value-cyan { color: #30c0c0; }
.value-red { color: #e84040; }
.value-default { color: #c8d4c0; }
```

---

## Building Tips

### 1. Use Knob as Template

Copy the structure:
```typescript
import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slider',  // Change this
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {
  @Input() value: number = 0;
  // ... rest of inputs
}
```

### 2. TypeScript Strict Mode

Use proper types:
```typescript
// ✅ Correct
const target = event.target as HTMLSelectElement;
const rect = element.getBoundingClientRect();

// ❌ Wrong
const target = event.target;  // Type 'EventTarget'
```

### 3. Signal Patterns

Follow Knob's pattern:
```typescript
// State
private isDragging = signal(false);

// Computed
rotation = computed(() => {
  return calculateRotation(this.value);
});
```

### 4. Color Theme

All components support same 4 colors:
```typescript
color: 'amber' | 'green' | 'cyan' | 'red'

colorClass = computed(() => `component-${this.color}`);
```

```css
.component-amber { color: #e8a020; }
.component-green { color: #3ddc6a; }
.component-cyan { color: #30c0c0; }
.component-red { color: #e84040; }
```

### 5. Testing Each Component

Add to Component Demo page:
```typescript
// In component-demo.component.ts
import { SliderComponent } from '../../shared/components/slider/slider.component';

// Add to imports
imports: [KnobComponent, SliderComponent, ...]

// Add to template
<app-slider
  [value]="patchLevel()"
  [min]="0"
  [max]="200"
  [label]="'Level Slider'"
  (valueChange)="onLevelChange($event)">
</app-slider>
```

---

## Recommended Order

1. **Dropdown** (easiest - just a styled select)
2. **LED** (simple - just display state)
3. **Parameter Label** (simple - read-only display)
4. **Slider** (medium - similar to Knob but simpler geometry)

---

## When You're Done

All 5 components complete? You'll have:

✅ Knob (rotary control)  
✅ Slider (linear fader)  
✅ Dropdown (enum selector)  
✅ LED (on/off indicator)  
✅ Parameter Label (read-only display)

Then we proceed to Phase 4: Patch Editor Shell (tabbed interface using these components)!

---

## Need Help?

If you get stuck building any component, just share what you have and I'll help debug!

**Prompt for Cursor/Copilot:**
```
Build a Slider component for Angular 21 following this spec:
[paste spec above]

Use the Knob component as reference:
[paste knob.component.ts]

Make it TypeScript strict mode compliant with Angular signals.
```
