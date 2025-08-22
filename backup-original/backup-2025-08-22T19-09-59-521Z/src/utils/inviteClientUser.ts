import { supabase } from "@/integrations/supabase/client";

type SupabaseUser = {
  id: string;
  email?: string;
  // ... other properties can be added as needed
};

/**
 * Creates a Supabase auth user (if not exists), links the user to the client in client_user_auth, and returns result.
 */
export async function inviteClientUser({
  email,
  password,
  clientId,
}: { 
  email: string,
  password: string, 
  clientId: string,
}): Promise<{ success: boolean; message: string; }> {
  try {
    // 1. See if the user already exists in Supabase Auth
    const { data: usersList, error: userListError } = await supabase.auth.admin.listUsers();
    if (userListError) {
      return { success: false, message: "Could not check if email already exists." };
    }

    let authUserId: string | null = null;

    if (usersList?.users) {
      // Explicitly cast usersList.users for TypeScript safety
      const users = usersList.users as SupabaseUser[];
      const foundUser = users.find(user => user.email === email);
      if (foundUser) {
        authUserId = foundUser.id;
      }
    }
    
    if (!authUserId) {
      // Create the auth user
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createErr || !created?.user) {
        return { success: false, message: createErr?.message || "Failed to create user." };
      }
      authUserId = created.user.id;
    }

    // 2. Link to client_user_auth only if not already linked
    const { error: linkErr } = await supabase
      .from("client_user_auth")
      .upsert([{ client_id: clientId, auth_user_id: authUserId }], { onConflict: "client_id,auth_user_id" });

    if (linkErr) {
      return { success: false, message: "Failed to link user to client. " + linkErr.message };
    }

    // 3. Update the email for client_onboarding if not set
    await supabase
      .from("client_onboarding")
      .update({ email })
      .eq("id", clientId);

    return { success: true, message: "Client user created and linked successfully!" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Something went wrong." };
  }
}
