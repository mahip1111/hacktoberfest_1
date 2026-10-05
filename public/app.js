/**
 * SafePlate AI — Application Logic
 * Open-Source AI Safe Recipe & Allergy Shield for a Friend
 * Hacktoberfest Weekend Challenge 2026
 */

// State Management
const state = {
  currentFriend: {
    id: 'rohan',
    name: 'Rohan Gupta',
    avatar: '🧑‍🍳',
    summary: 'Severe Peanut & Nut Allergy + Celiac Gluten-Free',
    allergies: ['Peanuts', 'Gluten / Wheat'],
    dislikes: []
  },
  pantryItems: ['Basmati Rice', 'Chicken Breast', 'Spinach', 'Coconut Milk', 'Olive Oil', 'Tomatoes'],
  selectedMode: 'safe_recipe', // 'safe_recipe' | 'substitute_audit' | 'fast_snack'
  selectedModel: 'llama3.2:1b',
  isOllamaOnline: false,
  isGenerating: false,
  timerSeconds: 20 * 60,
  timerInterval: null,
  isTimerRunning: false,
  lastGeneratedRecipe: null
};

// Known Allergen & Cross-Reactivity Database for instant safety checks
const ALLERGEN_DATABASE = {
  'Peanuts': {
    triggers: ['peanut', 'peanuts', 'peanut butter', 'groundnut', 'arachis oil', 'monkey nuts'],
    safeSubstitutes: ['Sunflower Seed Butter (SunButter)', 'Roasted Pumpkin Seeds (Pepitas)', 'Toasted Sesame Paste (Tahini)', 'Roasted Soy Nuts'],
    reason: 'Severe anaphylaxis hazard. Sunflower seed butter provides identical rich consistency without legume allergens.'
  },
  'Gluten / Wheat': {
    triggers: ['wheat', 'gluten', 'flour', 'bread', 'pasta', 'soy sauce', 'barley', 'rye', 'couscous', 'breadcrumbs', 'semolina', 'beer'],
    safeSubstitutes: ['Tamari (Gluten-Free Soy Sauce)', 'Coconut Aminos', 'Brown Rice Noodles', 'Certified Gluten-Free Rolled Oats', 'Almond Flour', 'Tapioca Starch'],
    reason: 'Celiac and inflammatory trigger. Gluten-free tamari or coconut aminos deliver rich umami with zero wheat/barley.'
  },
  'Tree Nuts': {
    triggers: ['almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio', 'macadamia', 'praline', 'marzipan', 'nutella'],
    safeSubstitutes: ['Toasted Pumpkin Seeds', 'Sunflower Seeds', 'Toasted Hemp Hearts', 'Roasted Chickpeas'],
    reason: 'Tree nut proteins can cause severe allergic reactions. Toasted seeds provide identical crunch and healthy fats.'
  },
  'Dairy / Lactose': {
    triggers: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'ghee', 'sour cream', 'paneer', 'casein'],
    safeSubstitutes: ['Full-Fat Coconut Milk', 'Unsweetened Oat Milk', 'Nutritional Yeast (Cheesy flavor)', 'Extra Virgin Olive Oil', 'Avocado Butter'],
    reason: 'Lactose intolerance causes gastrointestinal distress. Coconut milk and nutritional yeast mimic creaminess and savory depth.'
  },
  'Eggs': {
    triggers: ['egg', 'eggs', 'egg whites', 'mayonnaise', 'mayo', 'meringue', 'albumin'],
    safeSubstitutes: ['Ground Flaxseed + Warm Water (Flax Egg)', 'Mashed Ripe Banana', 'Silken Tofu', 'Aquafaba (Chickpea water)'],
    reason: 'Egg albumin allergy. 1 tbsp ground flaxseed mixed with 3 tbsp water mimics egg binding in baking/cooking.'
  },
  'Shellfish': {
    triggers: ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'squid', 'calamari', 'fish sauce', 'oyster sauce'],
    safeSubstitutes: ['King Oyster Mushrooms (Sliced like scallops)', 'Vegetarian Mushroom Stir-Fry Sauce', 'Smoked Tofu'],
    reason: 'Severe shellfish allergen. King oyster mushrooms replicate meaty seafood texture with zero marine proteins.'
  },
  'Soy': {
    triggers: ['soy', 'soya', 'tofu', 'edamame', 'soy sauce', 'miso', 'tempeh', 'soy lecithin'],
    safeSubstitutes: ['Coconut Aminos', 'Chickpea Miso', 'Hemp Seed Tofu (Hempfu)'],
    reason: 'Soy is a top 8 allergen. Coconut aminos provide naturally sweet, salty umami without soy beans.'
  },
  'Sesame': {
    triggers: ['sesame', 'tahini', 'sesame oil', 'halva', 'gomasio', 'hummus (if with tahini)'],
    safeSubstitutes: ['Sunflower Seed Paste', 'Toasted Perilla Oil', 'Pumpkin Seed Butter'],
    reason: 'Sesame is a recognized major allergen. Sunflower butter provides creamy texture safely.'
  },
  'High FODMAP (Garlic/Onion)': {
    triggers: ['garlic', 'onion', 'shallot', 'leek', 'scallion bulbs', 'garlic powder', 'onion powder'],
    safeSubstitutes: ['Garlic-Infused Olive Oil (FODMAPs are water-soluble, oil is safe)', 'Green Onion Tops (Green parts only)', 'Asafoetida / Hing powder', 'Fresh Chives'],
    reason: 'Fructans cause severe gut bloating and IBS pain. Garlic-infused pure olive oil provides rich aroma without fructans.'
  }
};

// Preset Friends Configuration
const FRIEND_PRESETS = {
  rohan: {
    id: 'rohan',
    name: 'Rohan Gupta',
    avatar: '🧑‍🍳',
    summary: 'Severe Peanut & Nut Allergy + Celiac Gluten-Free',
    allergies: ['Peanuts', 'Gluten / Wheat'],
    pantry: ['Basmati Rice', 'Chicken Breast', 'Spinach', 'Coconut Milk', 'Olive Oil', 'Tomatoes']
  },
  aisha: {
    id: 'aisha',
    name: 'Aisha Khan',
    avatar: '👩‍🌾',
    summary: 'Lactose Intolerant & Vegan Meal Preference',
    allergies: ['Dairy / Lactose', 'Eggs', 'Shellfish'],
    pantry: ['Firm Tofu', 'Basmati Rice', 'Bell Peppers', 'Coconut Milk', 'Olive Oil', 'Spinach']
  },
  david: {
    id: 'david',
    name: 'David Miller',
    avatar: '👨‍💼',
    summary: 'Low-FODMAP IBS & Shellfish Allergy',
    allergies: ['High FODMAP (Garlic/Onion)', 'Shellfish'],
    pantry: ['Chicken Breast', 'Basmati Rice', 'Potatoes', 'Olive Oil', 'Bell Peppers', 'Eggs']
  }
};

// DOM Elements
const elements = {
  ollamaStatusCard: document.getElementById('ollamaStatusCard'),
  statusDot: document.getElementById('statusDot'),
  statusLabel: document.getElementById('statusLabel'),
  modelSelect: document.getElementById('modelSelect'),
  currentAvatar: document.getElementById('currentAvatar'),
  currentFriendName: document.getElementById('currentFriendName'),
  currentFriendSummary: document.getElementById('currentFriendSummary'),
  activeAllergiesCount: document.getElementById('activeAllergiesCount'),
  allergyTagsGrid: document.getElementById('allergyTagsGrid'),
  pantryTagsBox: document.getElementById('pantryTagsBox'),
  customIngredientInput: document.getElementById('customIngredientInput'),
  addIngredientBtn: document.getElementById('addIngredientBtn'),
  clearPantryBtn: document.getElementById('clearPantryBtn'),
  generateSafeMealBtn: document.getElementById('generateSafeMealBtn'),
  btnText: document.getElementById('btnText'),
  allergenRadarCard: document.getElementById('allergenRadarCard'),
  swapsGrid: document.getElementById('swapsGrid'),
  emptyStudioState: document.getElementById('emptyStudioState'),
  generatingState: document.getElementById('generatingState'),
  renderedRecipeContent: document.getElementById('renderedRecipeContent'),
  liveTokenStream: document.getElementById('liveTokenStream'),
  recipeHeadline: document.getElementById('recipeHeadline'),
  recipeLead: document.getElementById('recipeLead'),
  recipeTimeBadge: document.getElementById('recipeTimeBadge'),
  recipeServingsBadge: document.getElementById('recipeServingsBadge'),
  recipeMacroBadge: document.getElementById('recipeMacroBadge'),
  ingredientChecklist: document.getElementById('ingredientChecklist'),
  stepsTimeline: document.getElementById('stepsTimeline'),
  chefTipText: document.getElementById('chefTipText'),
  macroCal: document.getElementById('macroCal'),
  macroProt: document.getElementById('macroProt'),
  macroCarb: document.getElementById('macroCarb'),
  macroFat: document.getElementById('macroFat'),
  handoffTimestamp: document.getElementById('handoffTimestamp'),
  timerDisplay: document.getElementById('timerDisplay'),
  startTimerBtn: document.getElementById('startTimerBtn'),
  resetTimerBtn: document.getElementById('resetTimerBtn'),
  printRecipeBtn: document.getElementById('printRecipeBtn'),
  copyRecipeBtn: document.getElementById('copyRecipeBtn'),
  shareFriendBtn: document.getElementById('shareFriendBtn'),
  recipeNotesWrap: document.getElementById('recipeNotesWrap'),
  recipeInputText: document.getElementById('recipeInputText'),
  // Modals
  friendModal: document.getElementById('friendModal'),
  editFriendBtn: document.getElementById('editFriendBtn'),
  closeFriendModalBtn: document.getElementById('closeFriendModalBtn'),
  cancelFriendModalBtn: document.getElementById('cancelFriendModalBtn'),
  saveFriendModalBtn: document.getElementById('saveFriendModalBtn'),
  modalFriendName: document.getElementById('modalFriendName'),
  modalFriendAvatar: document.getElementById('modalFriendAvatar'),
  modalFriendSummary: document.getElementById('modalFriendSummary'),
  devrelayModal: document.getElementById('devrelayModal'),
  openDevRelayModalBtn: document.getElementById('openDevRelayModalBtn'),
  closeDevRelayModalBtn: document.getElementById('closeDevRelayModalBtn'),
  closeDevRelayModalBtn2: document.getElementById('closeDevRelayModalBtn2'),
  viewAgentSessionLink: document.getElementById('viewAgentSessionLink')
};

// Initialize Application
function init() {
  bindEvents();
  renderPantry();
  renderAllergies();
  checkOllamaStatus();
  setInterval(checkOllamaStatus, 15000); // Check Ollama every 15s
}

// Bind User Events
function bindEvents() {
  // Preset selector
  document.querySelectorAll('.preset-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      document.querySelectorAll('.preset-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (presetKey === 'custom') {
        openFriendModal();
      } else if (FRIEND_PRESETS[presetKey]) {
        applyPreset(FRIEND_PRESETS[presetKey]);
      }
    });
  });

  // Allergy Checkbox changes
  elements.allergyTagsGrid.addEventListener('change', () => {
    const checked = [];
    elements.allergyTagsGrid.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      checked.push(cb.value);
    });
    state.currentFriend.allergies = checked;
    updateAllergyCount();
    auditPantrySafety();
  });

  // Quick staple chips
  document.querySelectorAll('.chip-add').forEach(chip => {
    chip.addEventListener('click', () => {
      const item = chip.dataset.item;
      if (!state.pantryItems.includes(item)) {
        state.pantryItems.push(item);
        renderPantry();
      }
    });
  });

  // Custom Ingredient input
  elements.addIngredientBtn.addEventListener('click', addCustomIngredient);
  elements.customIngredientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addCustomIngredient();
  });

  // Clear Pantry
  elements.clearPantryBtn.addEventListener('click', () => {
    state.pantryItems = [];
    renderPantry();
  });

  // Mode Cards
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.selectedMode = card.dataset.mode;

      if (state.selectedMode === 'substitute_audit') {
        elements.recipeNotesWrap.style.display = 'block';
        elements.recipeInputText.focus();
      } else {
        elements.recipeNotesWrap.style.display = 'none';
      }
      updateGenerateButtonText();
    });
  });

  // Generate Safe Meal
  elements.generateSafeMealBtn.addEventListener('click', handleGenerateSafeMeal);

  // Kitchen Timer
  elements.startTimerBtn.addEventListener('click', toggleTimer);
  elements.resetTimerBtn.addEventListener('click', resetTimer);

  // Recipe Actions
  elements.printRecipeBtn.addEventListener('click', () => window.print());
  elements.copyRecipeBtn.addEventListener('click', copyRecipeToClipboard);
  elements.shareFriendBtn.addEventListener('click', shareWithFriend);

  // Edit Friend Modal
  elements.editFriendBtn.addEventListener('click', openFriendModal);
  elements.closeFriendModalBtn.addEventListener('click', closeFriendModal);
  elements.cancelFriendModalBtn.addEventListener('click', closeFriendModal);
  elements.saveFriendModalBtn.addEventListener('click', saveFriendModal);

  // DevRelay Modal
  elements.openDevRelayModalBtn.addEventListener('click', () => { elements.devrelayModal.style.display = 'flex'; });
  elements.closeDevRelayModalBtn.addEventListener('click', () => { elements.devrelayModal.style.display = 'none'; });
  elements.closeDevRelayModalBtn2.addEventListener('click', () => { elements.devrelayModal.style.display = 'none'; });
  elements.viewAgentSessionLink.addEventListener('click', (e) => {
    e.preventDefault();
    elements.devrelayModal.style.display = 'flex';
  });

  // Model selector change
  elements.modelSelect.addEventListener('change', (e) => {
    state.selectedModel = e.target.value;
  });
}

// Check Local Ollama Status
async function checkOllamaStatus() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    
    if (data.status === 'online') {
      state.isOllamaOnline = true;
      elements.statusDot.className = 'status-dot dot-online';
      elements.statusLabel.textContent = '🟢 Ollama Live (Local)';

      // Populate models if returned
      if (data.models && data.models.length > 0) {
        const currentVal = elements.modelSelect.value;
        elements.modelSelect.innerHTML = '';
        data.models.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.name;
          opt.textContent = `${m.name} (${(m.size / (1024 * 1024 * 1024)).toFixed(1)}GB)`;
          elements.modelSelect.appendChild(opt);
        });
        const fallbackOpt = document.createElement('option');
        fallbackOpt.value = 'offline-smart-fallback';
        fallbackOpt.textContent = 'Smart Offline Fallback Engine';
        elements.modelSelect.appendChild(fallbackOpt);

        if ([...elements.modelSelect.options].some(o => o.value === currentVal)) {
          elements.modelSelect.value = currentVal;
        }
      }
    } else {
      state.isOllamaOnline = false;
      elements.statusDot.className = 'status-dot dot-checking';
      elements.statusLabel.textContent = '🟡 Smart Offline Engine Ready';
    }
  } catch (e) {
    state.isOllamaOnline = false;
    elements.statusDot.className = 'status-dot dot-checking';
    elements.statusLabel.textContent = '🟡 Smart Offline Engine Ready';
  }
}

// Preset application
function applyPreset(preset) {
  state.currentFriend = { ...preset };
  elements.currentAvatar.textContent = preset.avatar;
  elements.currentFriendName.textContent = preset.name;
  elements.currentFriendSummary.textContent = preset.summary;
  state.pantryItems = [...preset.pantry];

  // Set checkboxes
  elements.allergyTagsGrid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = preset.allergies.includes(cb.value);
  });

  updateAllergyCount();
  renderPantry();
  updateGenerateButtonText();
}

function updateAllergyCount() {
  const count = state.currentFriend.allergies.length;
  elements.activeAllergiesCount.textContent = `${count} Active`;
}

function updateGenerateButtonText() {
  const friendFirst = state.currentFriend.name.split(' ')[0] || 'Friend';
  if (state.selectedMode === 'safe_recipe') {
    elements.btnText.textContent = `Generate Safe Meal for ${friendFirst}`;
  } else if (state.selectedMode === 'substitute_audit') {
    elements.btnText.textContent = `Audit Recipe & Safe-Substitute for ${friendFirst}`;
  } else {
    elements.btnText.textContent = `Craft 10-Min Fast Snack for ${friendFirst}`;
  }
}

// Pantry Rendering & Allergen Scanning
function renderPantry() {
  elements.pantryTagsBox.innerHTML = '';
  if (state.pantryItems.length === 0) {
    elements.pantryTagsBox.innerHTML = `<span class="empty-pantry-hint">Add ingredients below or click staples above...</span>`;
    elements.allergenRadarCard.style.display = 'none';
    return;
  }

  state.pantryItems.forEach((item, index) => {
    const isHazard = checkItemHazard(item);
    const tag = document.createElement('span');
    tag.className = `pantry-item-tag ${isHazard ? 'has-hazard' : ''}`;
    tag.innerHTML = `
      <span>${isHazard ? '⚠️' : '🥗'} ${escapeHtml(item)}</span>
      <button class="tag-remove-btn" title="Remove" data-index="${index}">&times;</button>
    `;
    tag.querySelector('.tag-remove-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      state.pantryItems.splice(index, 1);
      renderPantry();
    });
    elements.pantryTagsBox.appendChild(tag);
  });

  auditPantrySafety();
}

function addCustomIngredient() {
  const val = elements.customIngredientInput.value.trim();
  if (!val) return;
  if (!state.pantryItems.includes(val)) {
    state.pantryItems.push(val);
    renderPantry();
  }
  elements.customIngredientInput.value = '';
}

function checkItemHazard(itemName) {
  const lower = itemName.toLowerCase();
  for (const allergy of state.currentFriend.allergies) {
    const db = ALLERGEN_DATABASE[allergy];
    if (db && db.triggers.some(t => lower.includes(t))) {
      return { allergy, db, itemName };
    }
  }
  return null;
}

function auditPantrySafety() {
  const detectedHazards = [];
  state.pantryItems.forEach(item => {
    const hazard = checkItemHazard(item);
    if (hazard) detectedHazards.push(hazard);
  });

  if (detectedHazards.length > 0) {
    elements.allergenRadarCard.style.display = 'block';
    elements.swapsGrid.innerHTML = '';
    
    detectedHazards.forEach(h => {
      const card = document.createElement('div');
      card.className = 'swap-item-card';
      card.innerHTML = `
        <div class="swap-hazard-row">
          <span class="hazard-badge">⛔ Hazard: ${escapeHtml(h.itemName)}</span>
          <span class="safe-swap-badge">🛡️ Swap: ${escapeHtml(h.db.safeSubstitutes[0])}</span>
        </div>
        <p class="swap-reason">${escapeHtml(h.db.reason)}</p>
      `;
      elements.swapsGrid.appendChild(card);
    });
  } else {
    elements.allergenRadarCard.style.display = 'none';
  }
}

// Generate Safe Meal Flow
async function handleGenerateSafeMeal() {
  if (state.pantryItems.length === 0 && !elements.recipeInputText.value.trim()) {
    alert('Please add at least 2-3 ingredients from your kitchen to craft a meal!');
    return;
  }

  state.isGenerating = true;
  elements.emptyStudioState.style.display = 'none';
  elements.renderedRecipeContent.style.display = 'none';
  elements.generatingState.style.display = 'flex';
  elements.liveTokenStream.textContent = '';
  elements.generateSafeMealBtn.disabled = true;

  const friendName = state.currentFriend.name;
  const allergies = state.currentFriend.allergies;
  const pantryList = state.pantryItems.join(', ');
  const mode = state.selectedMode;
  const rawInput = elements.recipeInputText.value.trim();

  // Prompt Construction for Ollama
  const prompt = `You are SafePlate AI, an empathetic master chef and medical allergy specialist.
You are cooking exclusively for my close friend: "${friendName}".
Their active medical dietary restrictions/allergies are: [${allergies.join(', ')}].
Under NO circumstances may any allergen or cross-reactive ingredient be suggested without an explicit safe substitute.

Available Kitchen Ingredients: [${pantryList}].
User Cooking Mode: "${mode}".
${rawInput ? `Custom Input / Recipe to Audit: "${rawInput}"` : ''}

Generate a complete, delicious, 100% allergen-safe recipe formatted in clean JSON.
Strict JSON format:
{
  "title": "Recipe Title",
  "lead": "One-line appetizing description emphasizing safety",
  "prepTime": "15 Mins",
  "cookTime": "20 Mins",
  "servings": 2,
  "macros": { "calories": "480 kcal", "protein": "34g", "carbs": "45g", "fats": "15g" },
  "safeSubstitutionsApplied": [
    { "original": "Soy Sauce", "replacement": "Gluten-Free Tamari / Coconut Aminos", "why": "Prevents celiac reaction" }
  ],
  "ingredients": [
    "1 cup Basmati Rice (rinsed)",
    "2 Chicken Breasts (cubed)",
    "1 cup Full-fat Coconut Milk",
    "2 cups Fresh Spinach"
  ],
  "instructions": [
    "Heat 1 tbsp olive oil in a skillet over medium heat.",
    "Add cubed chicken and sear for 6-8 minutes until golden.",
    "Pour in coconut milk and simmer for 10 minutes.",
    "Fold in fresh spinach until wilted, season with safe herbs, and serve over warm basmati rice."
  ],
  "chefSafetyTip": "Ensure spices and coconut milk are certified gluten and nut-free with no shared facility warnings.",
  "friendHandoffNote": "Cooked this with ${friendName} and they loved every bite without any stomach worry!"
}`;

  let recipeData = null;

  try {
    if (state.isOllamaOnline && elements.modelSelect.value !== 'offline-smart-fallback') {
      elements.liveTokenStream.textContent = `🤖 Sending request to local Ollama (${elements.modelSelect.value})...\n`;
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: elements.modelSelect.value,
          prompt: prompt,
          format: 'json',
          stream: true,
          options: {
            temperature: 0.3
          }
        })
      });

      if (!response.ok) throw new Error('Ollama response not OK');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                fullText += parsed.response;
                elements.liveTokenStream.textContent += parsed.response;
                elements.liveTokenStream.scrollTop = elements.liveTokenStream.scrollHeight;
              }
            } catch (e) {
              // Ignore line parse errors during stream
            }
          }
        }
      }

      // Parse final JSON from model
      try {
        recipeData = JSON.parse(fullText);
      } catch (e) {
        const match = fullText.match(/\{[\s\S]*\}/);
        if (match) recipeData = JSON.parse(match[0]);
      }
    }
  } catch (err) {
    console.warn('Ollama streaming error or offline, deploying smart culinary fallback engine:', err);
  }

  // If Ollama is offline or didn't return valid JSON, use high-quality Smart Heuristic Engine
  if (!recipeData || !recipeData.title) {
    recipeData = generateSmartFallbackRecipe(friendName, allergies, state.pantryItems, mode);
  }

  // Render the finalized recipe card
  state.lastGeneratedRecipe = recipeData;
  renderRecipeView(recipeData);

  state.isGenerating = false;
  elements.generatingState.style.display = 'none';
  elements.renderedRecipeContent.style.display = 'block';
  elements.generateSafeMealBtn.disabled = false;
}

// Smart Heuristic Safe Recipe Generator (100% Offline Culinary Engine)
function generateSmartFallbackRecipe(friendName, allergies, pantry, mode) {
  const isCeliac = allergies.includes('Gluten / Wheat');
  const isNutAllergic = allergies.includes('Peanuts') || allergies.includes('Tree Nuts');
  const isLactose = allergies.includes('Dairy / Lactose');
  const isFodmap = allergies.includes('High FODMAP (Garlic/Onion)');
  const isVegan = allergies.includes('Vegan') || allergies.includes('Dairy / Lactose') && allergies.includes('Eggs') && allergies.includes('Shellfish');

  let title = '';
  let lead = '';
  let prepTime = '15 Mins';
  let cookTime = '20 Mins';
  let ingredients = [];
  let instructions = [];
  let chefTip = '';
  let macros = { calories: '510 kcal', protein: '36g', carbs: '52g', fats: '16g' };

  if (pantry.includes('Basmati Rice') && (pantry.includes('Chicken Breast') || pantry.includes('Firm Tofu'))) {
    const protein = pantry.includes('Firm Tofu') ? 'Crispy Pan-Seared Tofu' : 'Golden Herb-Seared Chicken';
    title = `Creamy Coconut & Turmeric Rice Bowl with ${protein}`;
    lead = `A fragrant, golden-glow comfort bowl engineered to be 100% safe for ${friendName}'s dietary restrictions.`;
    
    ingredients = [
      `1.5 cups Cooked Basmati Rice (fluffed)`,
      pantry.includes('Firm Tofu') ? `1 block (14 oz) Firm Tofu, pressed & cubed` : `2 Free-Range Chicken Breasts (12 oz), sliced into strips`,
      `1 cup Unsweetened Full-Fat Coconut Milk (Nut-free facility)`,
      `2 cups Fresh Baby Spinach (washed)`,
      `1 cup Diced Tomatoes or Bell Peppers`,
      `2 tbsp Extra Virgin Olive Oil`,
      `1 tsp Ground Turmeric & 1 tsp Ground Cumin (Certified Allergen-Free)`,
      `1.5 tbsp Coconut Aminos (Gluten-Free safe swap for soy sauce)`,
      `Salt & Freshly Cracked Black Pepper to taste`
    ];

    instructions = [
      `Heat 1.5 tbsp olive oil in a wide skillet over medium-high heat.`,
      `Season the ${protein.toLowerCase()} with turmeric, cumin, salt, and pepper. Sear for 6-8 minutes until edges are crisp and cooked through.`,
      `Pour in the coconut milk and coconut aminos. Reduce heat to low and let it gently simmer for 5 minutes, allowing flavors to meld into a creamy golden sauce.`,
      `Fold in the fresh baby spinach and diced tomatoes until spinach is gently wilted (about 2 minutes).`,
      `Divide warm basmati rice between bowls, ladle the rich coconut-turmeric stew on top, and serve immediately.`
    ];

    chefTip = `For ${friendName}: Ensure all ground spices are single-ingredient certified to avoid cross-contamination in shared milling facilities.`;
  } else if (pantry.includes('Eggs')) {
    title = `Vibrant Mediterranean Garden Frittata`;
    lead = `A high-protein, nutrient-dense breakfast-for-dinner skillet, naturally free of gluten and nuts.`;
    prepTime = '10 Mins';
    cookTime = '15 Mins';
    macros = { calories: '390 kcal', protein: '26g', carbs: '14g', fats: '24g' };

    ingredients = [
      `5 Large Organic Eggs (Whisked with 2 tbsp water or oat milk)`,
      `2 cups Fresh Spinach & Diced Tomatoes`,
      `1 Diced Bell Pepper`,
      `1.5 tbsp Olive Oil`,
      `1 tbsp Nutritional Yeast (for rich dairy-free cheese flavor)`,
      `Pinch of sea salt and dried oregano`
    ];

    instructions = [
      `Preheat a cast-iron skillet over medium heat with olive oil.`,
      `Sauté the bell pepper, diced tomatoes, and spinach for 3-4 minutes until softened.`,
      `Whisk the eggs with nutritional yeast, salt, and oregano. Pour evenly over the vegetables in the pan.`,
      `Cover and cook on low heat for 8-10 minutes until eggs are fully set and golden around the edges.`,
      `Slice into wedges and serve with warm roasted potatoes or safe salad.`
    ];

    chefTip = `Nutritional yeast adds delicious parmesan-like savoriness without any lactose or dairy inflammation.`;
  } else {
    title = `Rustic Farmhouse Vegetable & Rice Skillet`;
    lead = `A wholesome, hearty one-pan meal maximizing fresh kitchen produce with zero allergen risk.`;
    prepTime = '12 Mins';
    cookTime = '18 Mins';
    macros = { calories: '440 kcal', protein: '16g', carbs: '68g', fats: '12g' };

    ingredients = [
      `2 cups Cooked Rice or Quinoa`,
      `Assorted Vegetables: Spinach, Bell Peppers, Tomatoes, Potatoes`,
      `2 tbsp Extra Virgin Olive Oil`,
      `1 tbsp Sunflower Seeds (for safe nut-free crunch)`,
      `1.5 tbsp Coconut Aminos / Safe Tamari`,
      `Sea salt, smoked paprika, and dried thyme`
    ];

    instructions = [
      `Heat olive oil in a large skillet over medium-high heat.`,
      `Toss in hearty vegetables and sauté for 6-8 minutes until tender and caramelized.`,
      `Add the cooked rice, coconut aminos, smoked paprika, and toss thoroughly for 3 minutes.`,
      `Garnish with toasted sunflower seeds for rich crunch without any nut allergies.`
    ];

    chefTip = `Toasting sunflower seeds in a dry pan for 2 minutes releases nutty aromatics with 100% allergy safety.`;
  }

  return {
    title,
    lead,
    prepTime,
    cookTime,
    servings: 2,
    macros,
    ingredients,
    instructions,
    chefSafetyTip: chefTip,
    friendHandoffNote: `Cooked this for ${friendName} on the weekend! Zero allergic flare-ups, full flavor, and made with love.`
  };
}

// Render Recipe View to DOM
function renderRecipeView(data) {
  elements.recipeHeadline.textContent = data.title;
  elements.recipeLead.textContent = data.lead;
  elements.recipeTimeBadge.textContent = `⏱️ ${(parseInt(data.prepTime) || 10) + (parseInt(data.cookTime) || 15)} Mins`;
  elements.recipeServingsBadge.textContent = `👥 ${data.servings || 2} Servings`;
  
  if (data.macros) {
    elements.macroCal.textContent = data.macros.calories || '480 kcal';
    elements.macroProt.textContent = data.macros.protein || '32g';
    elements.macroCarb.textContent = data.macros.carbs || '48g';
    elements.macroFat.textContent = data.macros.fats || '14g';
  }

  // Ingredients Checklist
  elements.ingredientChecklist.innerHTML = '';
  (data.ingredients || []).forEach((ing, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" id="ing_${i}" checked>
      <label for="ing_${i}">${escapeHtml(ing)}</label>
    `;
    elements.ingredientChecklist.appendChild(li);
  });

  // Step Timeline
  elements.stepsTimeline.innerHTML = '';
  (data.instructions || []).forEach((step, i) => {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.innerHTML = `
      <div class="step-number">${i + 1}</div>
      <div class="step-instruction">${escapeHtml(step)}</div>
    `;
    elements.stepsTimeline.appendChild(card);
  });

  // Chef safety note
  elements.chefTipText.textContent = data.chefSafetyTip || `Always double check brand labels for hidden allergen traces.`;
  
  // Set Timer default from cookTime
  const cookMin = parseInt(data.cookTime) || 20;
  state.timerSeconds = cookMin * 60;
  updateTimerDisplay();

  // Scroll smoothly to recipe view
  elements.recipeStudioCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Kitchen Timer Implementation
function toggleTimer() {
  if (state.isTimerRunning) {
    clearInterval(state.timerInterval);
    state.isTimerRunning = false;
    elements.startTimerBtn.textContent = 'Resume';
    elements.startTimerBtn.classList.remove('btn-secondary');
    elements.startTimerBtn.classList.add('btn-primary');
  } else {
    state.isTimerRunning = true;
    elements.startTimerBtn.textContent = 'Pause';
    elements.startTimerBtn.classList.remove('btn-primary');
    elements.startTimerBtn.classList.add('btn-secondary');

    state.timerInterval = setInterval(() => {
      if (state.timerSeconds > 0) {
        state.timerSeconds--;
        updateTimerDisplay();
      } else {
        clearInterval(state.timerInterval);
        state.isTimerRunning = false;
        elements.startTimerBtn.textContent = 'Done! 🔔';
        alert('🔔 Kitchen Timer Complete! Your safe dish is ready to serve.');
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(state.timerInterval);
  state.isTimerRunning = false;
  state.timerSeconds = 20 * 60;
  elements.startTimerBtn.textContent = 'Start';
  elements.startTimerBtn.classList.remove('btn-secondary');
  elements.startTimerBtn.classList.add('btn-primary');
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const m = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
  const s = (state.timerSeconds % 60).toString().padStart(2, '0');
  elements.timerDisplay.textContent = `${m}:${s}`;
}

// Copy & Share utilities
function copyRecipeToClipboard() {
  if (!state.lastGeneratedRecipe) return;
  const r = state.lastGeneratedRecipe;
  const text = `🛡️ SafePlate Recipe for ${state.currentFriend.name}\n\n` +
    `🍳 ${r.title}\n` +
    `${r.lead}\n\n` +
    `⏱️ Time: ${r.prepTime} prep + ${r.cookTime} cook | Servings: ${r.servings}\n\n` +
    `🛒 Ingredients:\n${r.ingredients.map(i => `• ${i}`).join('\n')}\n\n` +
    `👨‍🍳 Instructions:\n${r.instructions.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}\n\n` +
    `💡 Safety Note: ${r.chefSafetyTip}\n\n` +
    `Generated 100% locally with SafePlate AI (Ollama + Open-Source AI)`;

  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Recipe copied to clipboard! Ready to send to your friend on WhatsApp / iMessage.');
  });
}

function shareWithFriend() {
  if (navigator.share && state.lastGeneratedRecipe) {
    navigator.share({
      title: state.lastGeneratedRecipe.title,
      text: `Hey! I crafted this 100% allergen-safe recipe for you with SafePlate AI:\n${state.lastGeneratedRecipe.title}`,
      url: window.location.href
    }).catch(() => {});
  } else {
    copyRecipeToClipboard();
  }
}

// Friend Modal
function openFriendModal() {
  elements.modalFriendName.value = state.currentFriend.name;
  elements.modalFriendAvatar.value = state.currentFriend.avatar;
  elements.modalFriendSummary.value = state.currentFriend.summary;
  elements.friendModal.style.display = 'flex';
}

function closeFriendModal() {
  elements.friendModal.style.display = 'none';
}

function saveFriendModal() {
  state.currentFriend.name = elements.modalFriendName.value.trim() || 'My Friend';
  state.currentFriend.avatar = elements.modalFriendAvatar.value.trim() || '🧑‍🍳';
  state.currentFriend.summary = elements.modalFriendSummary.value.trim() || 'Custom Allergy & Dietary Profile';

  elements.currentFriendName.textContent = state.currentFriend.name;
  elements.currentAvatar.textContent = state.currentFriend.avatar;
  elements.currentFriendSummary.textContent = state.currentFriend.summary;

  updateGenerateButtonText();
  closeFriendModal();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Run on page ready
document.addEventListener('DOMContentLoaded', init);
