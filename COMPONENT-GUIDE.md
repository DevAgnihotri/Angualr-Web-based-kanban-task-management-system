# Angular Component Guide 🚀

A simple guide for creating and using Angular components in this project.

## 📋 Quick Setup

### 1. Generate a New Component

```bash
ng generate component my-component
# or short version
ng g c my-component
```

This creates 4 files:

- `my-component.component.ts` - The main component logic
- `my-component.component.html` - The template (what users see)
- `my-component.component.css` - The styles
- `my-component.component.spec.ts` - Tests

### 2. Where to Edit

**📄 Component Logic (`my-component.component.ts`)**

```typescript
export class MyComponentComponent {
  // Add your variables here
  clickCount = 0;
  message = "Hello World!";

  // Add your functions here
  onButtonClick() {
    this.clickCount++;
  }
}
```

**🎨 Template (`my-component.component.html`)**

```html
<div class="p-4 bg-white rounded shadow">
  <h2>{{ message }}</h2>
  <button (click)="onButtonClick()">Click me!</button>
  <p>Clicked {{ clickCount }} times</p>
</div>
```

### 3. Use Your Component

**Add to `app.component.ts`:**

```typescript
import { MyComponentComponent } from './my-component/my-component.component';

@Component({
  imports: [MyComponentComponent], // Add here
})
```

**Add to `app.component.html`:**

```html
<app-my-component></app-my-component>
```

## 🎯 Simple Click Button Component Example

### HTML Template

```html
<div class="max-w-sm mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
  <h2 class="text-xl font-bold mb-3">My Simple Component</h2>

  <button (click)="onButtonClick()" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Click me! 🎯</button>

  <p *ngIf="clickCount > 0" class="text-green-600 mt-2">Clicked {{ clickCount }} times! 🎊</p>
</div>
```

### TypeScript Logic

```typescript
export class MyComponentComponent {
  clickCount = 0;

  onButtonClick() {
    this.clickCount++;
    console.log(`Button clicked ${this.clickCount} times!`);
  }
}
```

## 🎨 Styling with Tailwind CSS

Use Tailwind classes in your HTML:

- `bg-blue-500` - Blue background
- `text-white` - White text
- `p-4` - Padding
- `rounded` - Rounded corners
- `shadow` - Drop shadow
- `hover:bg-blue-700` - Darker blue on hover

## 🔧 Common Patterns

### Display Data

```html
<h1>{{ title }}</h1>
<p>{{ description }}</p>
```

### Handle Click Events

```html
<button (click)="doSomething()">Click me</button>
```

### Conditional Display

```html
<p *ngIf="showMessage">This shows when showMessage is true</p>
```

### Lists

```html
<ul>
  <li *ngFor="let item of items">{{ item }}</li>
</ul>
```

## 🚀 Running Your App

```bash
ng serve
# or
npm start
```

Open http://localhost:4200 in your browser.

## 📁 File Structure

```
src/app/
├── app.component.ts      # Main app component
├── app.component.html    # Main app template
├── my-component/         # Your component folder
│   ├── my-component.component.ts    # Logic
│   ├── my-component.component.html  # Template
│   └── my-component.component.css   # Styles
```

## 💡 Tips

- Always import your component in `app.component.ts`
- Use Tailwind classes for quick styling
- Add `CommonModule` import if using *ngIf or *ngFor
- Check browser console for errors (F12)
- Component selector is `app-[component-name]`

---