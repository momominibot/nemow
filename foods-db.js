// Ovuluna Local Foods Database
// Nutrition data per 100g, based on USDA FoodData Central + 中国食物成分表 (China CDC)
// Used as fallback for whole foods not found in Open Food Facts
window.OVULUNA_FOODS_DB = [
  { name: "Spinach", aliases: ["spinach","菠菜","bayam"], icon: "spinach.png", nutriments: { energyKcal: 23, proteinG: 2.9, fatG: 0.4, carbsG: 3.6, sugarsG: 0.4, saltG: 0.08, fiberG: 2.2 }, novaGroup: 1, tags: ["iron","folate","leafy-green","cycle-support"] },
  { name: "Salmon", aliases: ["salmon","三文鱼","鲑鱼","ikan salmon"], icon: "salmon.png", nutriments: { energyKcal: 208, proteinG: 20.4, fatG: 13.4, carbsG: 0, sugarsG: 0, saltG: 0.06, fiberG: 0 }, novaGroup: 1, tags: ["omega3","vitamin-d","protein","anti-inflammatory"] },
  { name: "Lentils", aliases: ["lentils","lentil","小扁豆","红扁豆","kacang lentil"], icon: "lentils.png", nutriments: { energyKcal: 116, proteinG: 9.0, fatG: 0.4, carbsG: 20.1, sugarsG: 1.8, saltG: 0.02, fiberG: 7.9 }, novaGroup: 1, tags: ["iron","folate","fiber","plant-protein","cycle-support"] },
  { name: "Pumpkin Seeds", aliases: ["pumpkin seeds","pumpkin seed","南瓜子","biji labu"], icon: "pumpkin-seeds.png", nutriments: { energyKcal: 559, proteinG: 30.2, fatG: 49.1, carbsG: 10.7, sugarsG: 1.4, saltG: 0.02, fiberG: 6 }, novaGroup: 1, tags: ["zinc","magnesium","omega3","fertility"] },
  { name: "Greek Yogurt", aliases: ["greek yogurt","yogurt greek","希腊酸奶","yogurt","酸奶","yogurt"], icon: "greek-yogurt.png", nutriments: { energyKcal: 97, proteinG: 9.0, fatG: 5.0, carbsG: 3.6, sugarsG: 3.6, saltG: 0.05, fiberG: 0 }, novaGroup: 1, tags: ["probiotic","calcium","protein","gut-health"] },
  { name: "Blueberries", aliases: ["blueberries","blueberry","蓝莓","blue berry","beri biru"], icon: "blueberries.png", nutriments: { energyKcal: 57, proteinG: 0.7, fatG: 0.3, carbsG: 14.5, sugarsG: 10.0, saltG: 0.01, fiberG: 2.4 }, novaGroup: 1, tags: ["antioxidant","anthocyanin","anti-inflammatory","brain"] },
  { name: "Avocado", aliases: ["avocado","牛油果","鳄梨","alpukat"], icon: "avocado.png", nutriments: { energyKcal: 160, proteinG: 2.0, fatG: 14.7, carbsG: 8.5, sugarsG: 0.7, saltG: 0.01, fiberG: 6.7 }, novaGroup: 1, tags: ["healthy-fat","potassium","fiber","hormone"] },
  { name: "Almonds", aliases: ["almonds","almond","杏仁","巴旦木","kacang almond"], icon: "almonds.png", nutriments: { energyKcal: 579, proteinG: 21.2, fatG: 49.9, carbsG: 21.6, sugarsG: 4.4, saltG: 0.01, fiberG: 12.5 }, novaGroup: 1, tags: ["vitamin-e","magnesium","healthy-fat","bone"] },
  { name: "Broccoli", aliases: ["broccoli","西兰花","椰菜花","brokoli"], icon: "broccoli.png", nutriments: { energyKcal: 34, proteinG: 2.8, fatG: 0.4, carbsG: 6.6, sugarsG: 1.7, saltG: 0.03, fiberG: 2.6 }, novaGroup: 1, tags: ["calcium","vitamin-c","folate","cruciferous","estrogen"] },
  { name: "Chickpeas", aliases: ["chickpeas","chickpea","鹰嘴豆","kacang chickpea","kacang kuda"], icon: "chickpeas.png", nutriments: { energyKcal: 164, proteinG: 8.9, fatG: 2.6, carbsG: 27.4, sugarsG: 4.8, saltG: 0.02, fiberG: 7.6 }, novaGroup: 1, tags: ["fiber","plant-protein","iron","blood-sugar"] },
  { name: "Dark Chocolate", aliases: ["dark chocolate","chocolate dark","黑巧克力","coklat hitam"], icon: "dark-chocolate.png", nutriments: { energyKcal: 546, proteinG: 4.9, fatG: 31.0, carbsG: 60.4, sugarsG: 48.0, saltG: 0.02, fiberG: 7 }, novaGroup: 2, tags: ["magnesium","iron","antioxidant","mood","theobromine"] },
  { name: "Flaxseeds", aliases: ["flaxseeds","flax seed","flaxseed","亚麻籽","biji rami"], icon: "flaxseeds.png", nutriments: { energyKcal: 534, proteinG: 18.3, fatG: 42.2, carbsG: 28.9, sugarsG: 1.6, saltG: 0.03, fiberG: 27.3 }, novaGroup: 1, tags: ["omega3","lignan","fiber","estrogen","fertility"] },
  { name: "Kale", aliases: ["kale","羽衣甘蓝","kail"], icon: "kale.png", nutriments: { energyKcal: 49, proteinG: 4.3, fatG: 0.9, carbsG: 8.8, sugarsG: 2.3, saltG: 0.05, fiberG: 3.6 }, novaGroup: 1, tags: ["calcium","vitamin-k","iron","leafy-green","anti-inflammatory"] },
  { name: "Eggs", aliases: ["eggs","egg","鸡蛋","蛋","telur"], icon: "eggs.png", nutriments: { energyKcal: 155, proteinG: 13.0, fatG: 11.0, carbsG: 1.1, sugarsG: 1.1, saltG: 0.12, fiberG: 0 }, novaGroup: 1, tags: ["choline","protein","vitamin-d","fertility","brain"] },
  { name: "Oats", aliases: ["oats","oat","燕麦","oatmeal","燕麦片","gandum oat"], icon: "oats.png", nutriments: { energyKcal: 389, proteinG: 16.9, fatG: 6.9, carbsG: 66.3, sugarsG: 0.0, saltG: 0.02, fiberG: 10.6 }, novaGroup: 1, tags: ["fiber","beta-glucan","blood-sugar","cholesterol","cycle-support"] },
  { name: "Soy / Tofu", aliases: ["soy","tofu","soybean","大豆","豆腐","tempeh","tahu"], icon: "soy.png", nutriments: { energyKcal: 76, proteinG: 8.1, fatG: 4.8, carbsG: 1.9, sugarsG: 0.6, saltG: 0.01, fiberG: 0.3 }, novaGroup: 1, tags: ["phytoestrogen","isoflavone","plant-protein","calcium","bone"] },
  { name: "Sweet Potato", aliases: ["sweet potato","sweet potatoes","红薯","甘薯","番薯","ubi jalar"], icon: "sweet-potato.png", nutriments: { energyKcal: 86, proteinG: 1.6, fatG: 0.1, carbsG: 20.1, sugarsG: 4.2, saltG: 0.06, fiberG: 3 }, novaGroup: 1, tags: ["beta-carotene","vitamin-a","fiber","blood-sugar"] },
  { name: "Turmeric", aliases: ["turmeric","姜黄","kunyit"], icon: "turmeric.png", nutriments: { energyKcal: 312, proteinG: 9.7, fatG: 3.3, carbsG: 64.9, sugarsG: 3.2, saltG: 0.04, fiberG: 21.1 }, novaGroup: 1, tags: ["curcumin","anti-inflammatory","antioxidant","liver","pain"] },
  { name: "Walnuts", aliases: ["walnuts","walnut","核桃","胡桃","kacang walnut"], icon: "walnuts.png", nutriments: { energyKcal: 654, proteinG: 15.2, fatG: 65.2, carbsG: 13.7, sugarsG: 2.6, saltG: 0.02, fiberG: 6.7 }, novaGroup: 1, tags: ["omega3","melatonin","magnesium","sleep","brain"] },
  { name: "Ginger", aliases: ["ginger","姜","生姜","jahe"], nutriments: { energyKcal: 80, proteinG: 1.8, fatG: 0.8, carbsG: 17.8, sugarsG: 1.7, saltG: 0.01, fiberG: 2 }, novaGroup: 1, tags: ["gingerol","anti-nausea","anti-inflammatory","warming","digestion","cramps"] },
  { name: "Cinnamon", aliases: ["cinnamon","肉桂","桂皮","kayu manis"], nutriments: { energyKcal: 247, proteinG: 4.0, fatG: 1.2, carbsG: 80.7, sugarsG: 2.2, saltG: 0.01, fiberG: 53.1 }, novaGroup: 1, tags: ["cinnamaldehyde","insulin-sensitivity","blood-sugar","antioxidant"] },
  { name: "Berries (mixed)", aliases: ["berries","berry","莓果","混合莓","strawberry","raspberry","strawberries","草莓","framboos"], nutriments: { energyKcal: 40, proteinG: 0.8, fatG: 0.3, carbsG: 9.5, sugarsG: 5.0, saltG: 0.01, fiberG: 2 }, novaGroup: 1, tags: ["antioxidant","vitamin-c","anti-inflammatory","low-sugar"] },
  { name: "Chicken Breast", aliases: ["chicken breast","chicken","鸡胸肉","鸡肉","ayam","dada ayam"], nutriments: { energyKcal: 165, proteinG: 31.0, fatG: 3.6, carbsG: 0, sugarsG: 0, saltG: 0.07, fiberG: 0 }, novaGroup: 1, tags: ["lean-protein","iron","b-vitamin","muscle"] },
  { name: "Brown Rice", aliases: ["brown rice","糙米","玄米","beras perang","nasi coklat"], nutriments: { energyKcal: 112, proteinG: 2.6, fatG: 0.9, carbsG: 23.5, sugarsG: 0.4, saltG: 0.01, fiberG: 1.8 }, novaGroup: 1, tags: ["fiber","b-vitamin","magnesium","blood-sugar","complex-carb"] },
  { name: "Quinoa", aliases: ["quinoa","藜麦","藜麦","quinua"], nutriments: { energyKcal: 120, proteinG: 4.4, fatG: 1.9, carbsG: 21.3, sugarsG: 0.9, saltG: 0.01, fiberG: 2.8 }, novaGroup: 1, tags: ["complete-protein","fiber","iron","magnesium","gluten-free"] },
  { name: "Green Tea", aliases: ["green tea","绿茶","matcha","抹茶","teh hijau"], nutriments: { energyKcal: 1, proteinG: 0, fatG: 0, carbsG: 0.2, sugarsG: 0, saltG: 0.01, fiberG: 0 }, novaGroup: 1, tags: ["egcg","antioxidant","metabolism","caffeine","bone"] },
  { name: "Bone Broth", aliases: ["bone broth","骨汤","骨头汤","kaldu tulang"], nutriments: { energyKcal: 40, proteinG: 5.0, fatG: 2.0, carbsG: 0.5, sugarsG: 0, saltG: 0.5 }, novaGroup: 1, tags: ["collagen","gelatin","amino-acid","gut","joint","warming"] },
  { name: "Dates", aliases: ["dates","date","椰枣","海枣","kurma"], nutriments: { energyKcal: 282, proteinG: 2.5, fatG: 0.4, carbsG: 75.0, sugarsG: 63.4, saltG: 0.01 }, novaGroup: 1, tags: ["iron","potassium","fiber","energy","labor"] },
  { name: "Leafy Greens (mixed)", aliases: ["leafy greens","greens","绿叶菜","绿叶蔬菜","sayur hijau","kale","spinach","bok choy","小白菜","白菜"], nutriments: { energyKcal: 25, proteinG: 2.5, fatG: 0.3, carbsG: 4.5, sugarsG: 0.8, saltG: 0.05 }, novaGroup: 1, tags: ["iron","calcium","folate","vitamin-k","fiber"] },
  { name: "Miso", aliases: ["miso","味噌","みそ"], nutriments: { energyKcal: 268, proteinG: 14.0, fatG: 8.0, carbsG: 34.0, sugarsG: 7.0, saltG: 5.0 }, novaGroup: 2, tags: ["probiotic","fermented","gut","isoflavone","warming"] },
  { name: "Seaweed", aliases: ["seaweed","nori","kelp","海藻","海带","紫菜","rumput laut"], nutriments: { energyKcal: 35, proteinG: 5.8, fatG: 0.3, carbsG: 7.5, sugarsG: 0.5, saltG: 0.5 }, novaGroup: 1, tags: ["iodine","iron","calcium","mineral","thyroid"] },
  { name: "Tahini", aliases: ["tahini","sesame paste","芝麻酱","tahina"], nutriments: { energyKcal: 595, proteinG: 17.0, fatG: 53.0, carbsG: 21.0, sugarsG: 0.3, saltG: 0.01 }, novaGroup: 1, tags: ["calcium","iron","healthy-fat","sesame","bone"] },
  { name: "Kimchi", aliases: ["kimchi","泡菜","韩式泡菜","kimci"], nutriments: { energyKcal: 32, proteinG: 2.0, fatG: 0.4, carbsG: 6.0, sugarsG: 1.5, saltG: 0.8 }, novaGroup: 2, tags: ["probiotic","fermented","gut","vitamin-c","fiber"] },
  { name: "Sauerkraut", aliases: ["sauerkraut","fermented cabbage","酸菜","德国酸菜"], nutriments: { energyKcal: 19, proteinG: 0.9, fatG: 0.1, carbsG: 4.3, sugarsG: 1.8, saltG: 0.7 }, novaGroup: 2, tags: ["probiotic","fermented","gut","vitamin-c","fiber"] },
  { name: "Apple Cider Vinegar", aliases: ["apple cider vinegar","acv","苹果醋","cuka apel"], nutriments: { energyKcal: 22, proteinG: 0, fatG: 0, carbsG: 0.9, sugarsG: 0.4, saltG: 0.01 }, novaGroup: 1, tags: ["acetic-acid","blood-sugar","insulin","digestion"] },
  { name: "Red Wine (moderate)", aliases: ["red wine","红酒","葡萄酒","anggur merah"], nutriments: { energyKcal: 85, proteinG: 0.1, fatG: 0, carbsG: 2.6, sugarsG: 0.6, saltG: 0.01 }, novaGroup: 2, tags: ["resveratrol","antioxidant","heart","moderation"] },
  { name: "Pomegranate", aliases: ["pomegranate","石榴","delima","buah delima"], nutriments: { energyKcal: 83, proteinG: 1.7, fatG: 1.2, carbsG: 18.7, sugarsG: 13.7, saltG: 0.01 }, novaGroup: 1, tags: ["antioxidant","polyphenol","anti-inflammatory","blood-flow","fertility"] },
  { name: "Beets", aliases: ["beets","beetroot","甜菜根","甜菜","bit","ubi bit"], nutriments: { energyKcal: 43, proteinG: 1.6, fatG: 0.2, carbsG: 9.6, sugarsG: 6.8, saltG: 0.08 }, novaGroup: 1, tags: ["nitrate","blood-flow","iron","folate","exercise"] },
  { name: "Asparagus", aliases: ["asparagus","芦笋","asparagus"], nutriments: { energyKcal: 20, proteinG: 2.2, fatG: 0.1, carbsG: 3.9, sugarsG: 1.9, saltG: 0.01 }, novaGroup: 1, tags: ["folate","vitamin-k","fiber","prebiotic","detox"] }
];

// Search local database by keyword
window.searchLocalFoods = function(query){
  if(!query) return [];
  var q = query.toLowerCase().trim();
  return window.OVULUNA_FOODS_DB.filter(function(f){
    if(f.name.toLowerCase().indexOf(q) !== -1) return true;
    return (f.aliases || []).some(function(a){ return a.toLowerCase().indexOf(q) !== -1; });
  });
};

// Get a single food by exact/closest match
window.getLocalFood = function(query){
  var results = window.searchLocalFoods(query);
  if(results.length === 0) return null;
  // Prefer exact name match
  var q = query.toLowerCase().trim();
  var exact = results.find(function(f){ return f.name.toLowerCase() === q; });
  return exact || results[0];
};
