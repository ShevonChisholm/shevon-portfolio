# Development Guide

Detailed technical documentation for developers working on this portfolio CMS.

---

## 🏗️ CMS Architecture

### Data Flow

```
Public User
    ↓
[Next.js Pages] → [Supabase Client] → [PostgreSQL]
                                    ↓
                           [RLS Policies]
                           (public only)

Admin User
    ↓
[Protected Admin Pages] → [Supabase Client] → [PostgreSQL]
    ↓                                         ↓
[Supabase Auth]                       [RLS Policies]
                                      (admin access)
```

### Key Concepts

**Server Components** - Used for data fetching and SEO
```tsx
export default async function Home() {
  const projects = await getPublishedProjects();
  return <Projects projects={projects} />;
}
```

**Client Components** - Used for interactivity and forms
```tsx
"use client";

export default function ProjectForm() {
  const [values, setValues] = useState(...);
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**API Routes** - For mutations and webhooks
```tsx
// src/app/api/contact/route.ts
export async function POST(req: Request) {
  const data = await req.json();
  // Process contact form
}
```

---

## 📊 Database Schema

### Core Tables

**Projects**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  category TEXT,
  project_type TEXT,
  is_published BOOLEAN,
  is_featured BOOLEAN,
  sort_order INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  ...
);
```

**Blog Posts**
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  content TEXT (MDX),
  excerpt TEXT,
  cover_image_url TEXT,
  tags TEXT[],
  is_published BOOLEAN,
  published_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  ...
);
```

**Experience & Education**
```sql
CREATE TABLE experience_items (
  id UUID PRIMARY KEY,
  title TEXT,
  company TEXT,
  period TEXT,
  description TEXT,
  is_current BOOLEAN,
  sort_order INTEGER,
  is_published BOOLEAN,
  ...
);
```

**Skills**
```sql
CREATE TABLE skill_categories (
  id UUID PRIMARY KEY,
  title TEXT,
  icon TEXT,
  sort_order INTEGER,
  is_published BOOLEAN,
  ...
);

CREATE TABLE skills (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES skill_categories,
  name TEXT,
  sort_order INTEGER,
  is_published BOOLEAN,
  ...
);
```

**Site Settings**
```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY,
  setting_key TEXT UNIQUE,
  setting_value JSONB,
  ...
);
```

See `supabase/*.sql` for complete schema and RLS policies.

---

## 🔐 Authentication & Authorization

### Supabase Auth

**Public Access**
- No authentication required
- Can only access published content via RLS

**Admin Access**
- Email/password authentication
- User must have admin role in `auth.users` metadata
- Protected routes check auth state

### RLS Policies

Example policy for published projects:
```sql
CREATE POLICY "Public can view published projects"
  ON projects
  FOR SELECT
  USING (is_published = true);
```

Example policy for admin projects:
```sql
CREATE POLICY "Admins can manage projects"
  ON projects
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'authenticated' 
    AND (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');
```

---

## 📝 CMS Operations

### Adding New Content Type

1. **Create database table** with RLS policies
2. **Define TypeScript types** in `src/types/cms.ts`
3. **Create public API** in `src/lib/cms/public-*.ts`
   ```tsx
   export async function getPublishedItems() {
     const supabase = createClient();
     const { data, error } = await supabase
       .from('my_table')
       .select('*')
       .eq('is_published', true);
     
     if (error) throw new Error(error.message);
     return data;
   }
   ```

4. **Create admin API** in `src/lib/cms/admin-*.ts`
   ```tsx
   export async function createItem(values: ItemFormValues) {
     return adminDataRequest({
       table: 'my_table',
       action: 'insert',
       values: itemPayload(values),
     });
   }
   ```

5. **Create form component** in `src/components/admin/my-content/`
6. **Create admin page** in `src/app/admin/my-content/`

---

## 🎬 Working with Media

### File Upload Flow

```
User selects file
        ↓
File validated (type, size)
        ↓
Upload to Supabase Storage
        ↓
Get public URL
        ↓
Save URL to database
```

### Image Handling

**Client-side:**
```tsx
const handleImageSelect = async (file: File) => {
  const url = await uploadCmsMedia(file, 'projects');
  setValues({ ...values, image_url: url });
};
```

**Server-side:**
```tsx
export async function uploadCmsMedia(file: File, bucket: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
  
  if (error) throw new Error(error.message);
  return publicMediaUrl(data.path);
}
```

### Supported Media
- **Images:** JPG, PNG, WebP (projects, blogs, profiles)
- **Videos:** MP4, WebM (project demonstrations)
- **Documents:** PDF (case studies, resume)

---

## 📋 Forms & Validation

### Form Pattern

All CMS forms follow this pattern:

1. **Type Definition**
   ```tsx
   interface MyFormValues {
     title: string;
     description: string;
     is_published: boolean;
   }
   ```

2. **Empty State**
   ```tsx
   const emptyMyFormValues: MyFormValues = {
     title: '',
     description: '',
     is_published: true,
   };
   ```

3. **Form Component**
   ```tsx
   export default function MyForm({ initialValues, onSubmit }) {
     const [values, setValues] = useState(initialValues);
     
     return (
       <form onSubmit={handleSubmit}>
         <TextField 
           value={values.title}
           onChange={(e) => setValues({ 
             ...values, 
             title: e.target.value 
           })}
         />
       </form>
     );
   }
   ```

### Validation

**Client-side:** Immediate feedback
- Required field checks
- Format validation (URLs, emails)
- Character limits

**Server-side:** Authorization & data integrity
- User authentication
- Permission checks
- Data consistency

---

## 🎨 Component Patterns

### Page Wrapper Pattern

```tsx
// Page component (Server)
export default async function ProjectPage() {
  const project = await getPublishedProject(slug);
  if (!project) notFound();
  
  return <ProjectDetailsClient project={project} />;
}

// Client component for interactivity
export default function ProjectDetailsClient({ project }) {
  const [state, setState] = useState(...);
  return (
    <Box>
      {/* Interactive content */}
    </Box>
  );
}
```

### Admin Form Pattern

```tsx
"use client";

export default function AdminForm({ itemId, onSuccess }) {
  const [values, setValues] = useState(initialValues);
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateItem(itemId, values);
        onSuccess();
      } catch (error) {
        setError(error.message);
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isPending}>
        Save
      </Button>
    </form>
  );
}
```

---

## 🔗 API Routes

### Contact Form Endpoint

```tsx
// POST /api/contact
export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();
  
  // Validate
  if (!name || !email || !message) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  try {
    // Save to database
    await saveContactMessage({ name, email, subject, message });
    
    // Send email notification
    await sendContactNotification({ email, name });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Admin API Pattern

```tsx
// POST /api/admin/projects
export async function POST(req: Request) {
  // Check authentication
  const session = await getAuthSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check admin role
  if (!session.user.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Process request
  const data = await req.json();
  const project = await createProject(data);
  
  return Response.json(project);
}
```

---

## 🎨 Theme & Styling

### Material UI Configuration

Theme is defined in `src/theme/theme.ts`:

```tsx
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6600',
    },
    background: {
      default: '#0a0e27',
      paper: '#141829',
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 800,
    },
  },
});
```

### Styling Components

Use the `sx` prop for component-level styling:

```tsx
<Box sx={{
  display: 'flex',
  gap: 2,
  p: 3,
  bgcolor: 'background.paper',
  borderRadius: 1.5,
}}>
  {/* Content */}
</Box>
```

---

## 🧪 Testing & Quality

### TypeScript Checks
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Build Validation
```bash
npm run build
```

---

## 🚀 Deployment

### Environment Variables Required

**Production (.env.production.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_key
SUPABASE_SERVICE_ROLE_KEY=production_service_key
```

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main

---

## 🐛 Debugging Tips

### Enable Detailed Logging

```tsx
// In lib/supabase/client.ts
const supabase = createClient({
  isDebug: true,
  // ...
});
```

### Check RLS Policies

```sql
-- Verify policies are in place
SELECT * FROM pg_policies 
WHERE tablename = 'projects';
```

### Test Auth State

```tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event);
    console.log('Session:', session);
  });
  
  return () => subscription.unsubscribe();
}, []);
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Material UI Docs](https://mui.com/material-ui/getting-started/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)