-- Add client_id column to deep_work_tasks table
-- This allows linking deep work tasks to specific clients

-- Add the column (nullable to support existing personal tasks)
ALTER TABLE deep_work_tasks
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES client_onboarding(id) ON DELETE SET NULL;

-- Create index for efficient client-filtered queries
CREATE INDEX IF NOT EXISTS idx_deep_work_tasks_client_id
ON deep_work_tasks(client_id);

-- Create composite index for user + client queries
CREATE INDEX IF NOT EXISTS idx_deep_work_tasks_user_client
ON deep_work_tasks(user_id, client_id);

-- Add comment for documentation
COMMENT ON COLUMN deep_work_tasks.client_id IS
'Optional client linkage. NULL = personal task, UUID = client-specific task';
