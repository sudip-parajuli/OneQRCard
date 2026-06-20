import { supabaseAdmin } from "./supabase";

/**
 * Gets the card limit for a given plan tier.
 */
export function getCardLimitForPlan(plan: string): number {
  if (plan === "business") return 5;
  if (plan === "pro") return 1;
  return 1; // basic/free
}

/**
 * Activates a workspace for a card when it is paid or activated.
 */
export async function activateWorkspaceForCard(cardId: string) {
  const db = supabaseAdmin();
  
  // 1. Fetch the card
  const { data: card, error: fetchErr } = await db
    .from("cards")
    .select("*")
    .eq("id", cardId)
    .maybeSingle();

  if (fetchErr || !card) {
    throw new Error(fetchErr?.message || "Card not found for activation");
  }

  const ownerEmail = card.owner_email || card.email || "";
  const plan = card.plan || "basic";
  const limit = getCardLimitForPlan(plan);

  // 2. Check if a paid/active workspace already exists for this owner
  const { data: existingWs } = await db
    .from("workspaces")
    .select("*")
    .eq("owner_email", ownerEmail)
    .eq("plan", plan)
    .maybeSingle();

  let workspace = existingWs;

  if (!workspace) {
    // 3. Create a new workspace
    const { data: newWs, error: createErr } = await db
      .from("workspaces")
      .insert({
        owner_email: ownerEmail,
        plan,
        card_limit: limit,
        payment_status: "paid"
      })
      .select()
      .single();

    if (createErr || !newWs) {
      throw new Error(createErr?.message || "Failed to create workspace");
    }
    workspace = newWs;
  }

  // 4. Update the card to link it to the workspace
  const { error: updateErr } = await db
    .from("cards")
    .update({
      workspace_id: workspace.id,
      is_primary: true
    })
    .eq("id", cardId);

  if (updateErr) {
    throw new Error(updateErr.message);
  }

  return workspace;
}

/**
 * Upgrades a card's workspace to a new plan tier.
 */
export async function upgradeWorkspaceForCard(cardId: string, targetPlan: string) {
  const db = supabaseAdmin();

  // 1. Fetch the card
  const { data: card, error: fetchErr } = await db
    .from("cards")
    .select("*")
    .eq("id", cardId)
    .maybeSingle();

  if (fetchErr || !card) {
    throw new Error(fetchErr?.message || "Card not found for upgrade");
  }

  const limit = getCardLimitForPlan(targetPlan);

  if (card.workspace_id) {
    // 2. Update the existing workspace
    const { error: wsUpdateErr } = await db
      .from("workspaces")
      .update({
        plan: targetPlan,
        card_limit: limit,
        payment_status: "paid"
      })
      .eq("id", card.workspace_id);

    if (wsUpdateErr) {
      throw new Error(wsUpdateErr.message);
    }
  } else {
    // If the card did not have a workspace yet, activate it now!
    const { error: cardUpdateErr } = await db
      .from("cards")
      .update({ plan: targetPlan })
      .eq("id", cardId);
    
    if (cardUpdateErr) {
      throw new Error(cardUpdateErr.message);
    }

    await activateWorkspaceForCard(cardId);
  }
}

/**
 * Self-healing workspace sync. Ensures every user card is linked to a workspace,
 * creating one if none exists.
 */
export async function syncUserWorkspaces(ownerEmail: string) {
  const db = supabaseAdmin();
  
  // 1. Get all cards for this email
  const { data: cards, error: cardsErr } = await db
    .from("cards")
    .select("*")
    .eq("owner_email", ownerEmail);
    
  if (cardsErr) {
    console.error("Error fetching user cards for sync:", cardsErr);
    return;
  }
  
  // 2. Get all workspaces for this email
  const { data: workspaces, error: wsErr } = await db
    .from("workspaces")
    .select("*")
    .eq("owner_email", ownerEmail);
    
  if (wsErr) {
    console.error("Error fetching user workspaces for sync:", wsErr);
    return;
  }
  
  let targetWorkspace = workspaces && workspaces.length > 0 ? workspaces[0] : null;
  
  // 3. If no workspaces exist but cards do exist, create a workspace based on cards
  if (!targetWorkspace && cards && cards.length > 0) {
    // Determine the highest plan tier among their cards
    let plan = "basic";
    if (cards.some(c => c.plan === "business")) {
      plan = "business";
    } else if (cards.some(c => c.plan === "pro")) {
      plan = "pro";
    }
    
    const limit = getCardLimitForPlan(plan);
    const { data: newWs, error: createErr } = await db
      .from("workspaces")
      .insert({
        owner_email: ownerEmail,
        plan,
        card_limit: limit,
        payment_status: "paid"
      })
      .select()
      .single();
      
    if (createErr || !newWs) {
      console.error("Failed to create self-healing workspace:", createErr);
      return;
    }
    targetWorkspace = newWs;
  }
  
  // 4. Link any cards that don't have a workspace_id to our target workspace
  if (targetWorkspace && cards) {
    const unlinkedCards = cards.filter(c => !c.workspace_id);
    if (unlinkedCards.length > 0) {
      const hasPrimary = cards.some(c => c.workspace_id === targetWorkspace.id && c.is_primary);
      
      for (let i = 0; i < unlinkedCards.length; i++) {
        const card = unlinkedCards[i];
        const isPrimary = !hasPrimary && i === 0 && !card.parent_id;
        
        await db
          .from("cards")
          .update({
            workspace_id: targetWorkspace.id,
            is_primary: isPrimary
          })
          .eq("id", card.id);
      }
    }
  }
}

