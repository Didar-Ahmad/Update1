
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.prints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  size text NOT NULL DEFAULT 'A3',
  category text NOT NULL DEFAULT 'Poster',
  image_url text NOT NULL DEFAULT '',
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.prints TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prints TO authenticated;
GRANT ALL ON public.prints TO service_role;
ALTER TABLE public.prints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published prints are viewable by everyone" ON public.prints
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all prints" ON public.prints
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert prints" ON public.prints
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update prints" ON public.prints
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete prints" ON public.prints
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_prints_updated_at BEFORE UPDATE ON public.prints
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.prints (title, slug, description, price, size, category, image_url, featured) VALUES
('Midnight Ridge', 'midnight-ridge', 'Layered risograph mountains in deep indigo and ember orange. Printed on 300gsm cotton rag.', 34.00, 'A2', 'Landscape', 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=900&q=80', true),
('Solar Bloom', 'solar-bloom', 'A bold botanical study in sun-bleached yellows. Giclee print with archival inks.', 28.00, 'A3', 'Botanical', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=80', true),
('Concrete Poetry', 'concrete-poetry', 'Brutalist typography poster celebrating raw form and negative space.', 22.00, 'A3', 'Typography', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80', false),
('Tide Study No. 4', 'tide-study-no-4', 'Long-exposure coastline in muted greys. Matte fine art paper.', 40.00, 'A1', 'Photography', 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=900&q=80', true),
('Paper Sun', 'paper-sun', 'Minimal geometric sunrise in three warm tones. Hand-pulled screen print.', 26.00, 'A3', 'Abstract', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=80', false),
('Quiet Interior', 'quiet-interior', 'A soft still life of morning light across an empty room.', 30.00, 'A2', 'Photography', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80', false);
