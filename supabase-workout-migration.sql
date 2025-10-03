-- Create workout_items table for SISO Wellness/Health tracking
-- This migration adds proper database support for the workout functionality

CREATE TABLE IF NOT EXISTS workout_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    target TEXT,
    logged TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_workout_items_user_date ON workout_items(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_workout_items_date ON workout_items(workout_date);

-- Enable RLS (Row Level Security)
ALTER TABLE workout_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own workout items" ON workout_items
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own workout items" ON workout_items
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own workout items" ON workout_items
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own workout items" ON workout_items
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_items_updated_at 
    BEFORE UPDATE ON workout_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();