"use client";

import { BookOpen } from "lucide-react";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { MarkdownContent } from "@/components/MarkdownContent";

type LearningContent = { title: string; description: string; objectives: string[]; body: string };

const englishMaterials: Record<string, LearningContent> = {
  "sel-dan-struktur-sel": {
    title: "Cell Structure and Organization",
    description: "Explore cells as the basic units of life, how organelle structures support their functions, and how cell membranes regulate the movement of substances.",
    objectives: [
      "Explain why cells are the structural and functional units of life.",
      "Relate organelle structures to their functions and to the movement of materials within a cell.",
      "Compare prokaryotic and eukaryotic cells, as well as animal and plant cells.",
      "Analyze how substances cross membranes in response to concentration gradients.",
    ],
    body: `# Cell Structure and Organization

## Overview

A cell is the smallest unit of life that can carry out essential processes: obtaining energy, maintaining internal conditions, responding to stimuli, and reproducing. Although cells are microscopic, they contain coordinated systems. Their shapes vary with their roles: a neuron is elongated to transmit signals, while a red blood cell has a shape that supports gas exchange.

Modern cell theory states that all living things consist of one or more cells, that the cell is the basic unit of structure and function, and that new cells arise from existing cells. Viruses are not made of cells and can reproduce only by using a host cell, so they are not considered cellular organisms.

## Prokaryotic and eukaryotic cells

- **Prokaryotic cells**, such as bacteria, do not have a membrane-bound nucleus. Their genetic material lies in a nucleoid region. They still have a cell membrane, cytoplasm, ribosomes, and usually a cell wall.
- **Eukaryotic cells**, including those of animals, plants, fungi, and protists, have a membrane-bound nucleus and specialized organelles. This internal organization allows different reactions to take place in suitable conditions.

## Cell membranes and transport

The cell membrane consists mainly of a phospholipid bilayer with embedded proteins. The hydrophilic heads interact with water, while the hydrophobic tails face away from it. This flexible, **selectively permeable** boundary allows some substances to pass directly while others need transport proteins or energy.

- **Diffusion** is the net movement of particles from a region of higher concentration to one of lower concentration. For example, oxygen diffuses from the alveoli into the blood because its concentration is higher in the alveoli.
- **Osmosis** is the movement of water through a selectively permeable membrane from a more dilute solution toward a more concentrated one. Plant cells that lose water become limp; water entering the cell can restore turgor as the vacuole presses against the cell wall.
- **Active transport** moves substances against a concentration gradient and requires ATP and carrier proteins. The sodium-potassium pump in animal cell membranes is one example.
- Larger materials can enter or leave by **endocytosis** and **exocytosis**, processes in which the membrane forms or fuses with vesicles.

## Organelles and teamwork

- **The nucleus** stores most of the cell's DNA and regulates cell activity through gene expression. The nucleolus inside it helps produce ribosome components.
- **Ribosomes** join amino acids to build proteins. Free ribosomes mainly make proteins used in the cytoplasm; ribosomes on rough endoplasmic reticulum make many membrane and secreted proteins.
- **Rough endoplasmic reticulum** helps process newly made proteins. **Smooth endoplasmic reticulum** makes lipids, processes certain substances, and stores calcium ions in some cells.
- **The Golgi apparatus** modifies, sorts, and packages proteins and lipids into vesicles for delivery.
- **Mitochondria** are the main site of aerobic respiration and ATP production. Cells with high energy demands, such as muscle cells, often contain many mitochondria.
- **Lysosomes** contain enzymes that break down incoming materials and worn-out cell parts.
- **Chloroplasts** capture light energy for photosynthesis in plants and algae. The large plant **central vacuole** stores water and dissolved substances and supports turgor. The cellulose **cell wall** provides support and protection but does not replace the membrane's role in regulating transport.

A protein that will leave the cell illustrates organelle teamwork: genetic information is read in the nucleus, ribosomes on rough ER assemble the protein, vesicles carry it to the Golgi apparatus for processing and packaging, and another vesicle releases it by exocytosis.

## Animal and plant cells

Both are eukaryotic and share a cell membrane, nucleus, mitochondria, endoplasmic reticulum, Golgi apparatus, and ribosomes. Plant cells generally have a cell wall, chloroplasts in photosynthetic tissues, and a large central vacuole. Animal cells lack cell walls and chloroplasts, have more flexible shapes, and many contain a centrosome with centrioles. Not every plant cell has chloroplasts: root cells underground, for example, usually do not photosynthesize.

## Applying the concepts

When a red blood cell is placed in a highly concentrated solution, water leaves by osmosis and the cell shrinks. When a plant cell lacks water, its vacuole shrinks and turgor pressure falls, causing the plant to wilt. Both examples show how the surrounding solution affects water movement across a membrane.

In summary, cell function depends on coordination: membranes regulate exchange, DNA stores instructions, ribosomes build proteins, organelles process and deliver materials, and mitochondria supply energy. Structure and function are closely connected.`,
  },
  "jaringan-tumbuhan-hewan": {
    title: "Plant and Animal Tissues",
    description: "Compare specialized plant and animal tissues, how their cells are organized, and how each tissue supports the functions of an organ.",
    objectives: [
      "Describe how specialized cells form tissues with particular functions.",
      "Distinguish meristematic tissue from mature plant tissues.",
      "Compare xylem and phloem transport in plants.",
      "Identify the roles of epithelial, connective, muscle, and nervous tissue in animals.",
    ],
    body: `# Plant and Animal Tissues

## From cells to tissues

A tissue is a group of similar or cooperating cells that performs a particular function. Different tissues work together to form organs, and organs coordinate within organ systems. Specialization allows an organism to divide complex tasks efficiently, but it also makes tissues dependent on one another.

## Plant tissues

**Meristematic tissue** contains actively dividing cells and enables growth. Apical meristems at root and shoot tips increase length, while lateral meristems contribute to increased thickness. As new cells mature, they develop structures suited to their roles.

- **Epidermal tissue** covers and protects plant surfaces. A waxy cuticle reduces water loss. Stomata, controlled by guard cells, allow carbon dioxide to enter and water vapor and oxygen to leave. Root hairs increase the surface area for water and mineral absorption.
- **Parenchyma** consists of living, relatively flexible cells. It can store food or water, repair tissue, and carry out photosynthesis when chloroplasts are present.
- **Collenchyma** provides flexible support in growing regions. **Sclerenchyma** has thick, often lignified walls and provides stronger support; many sclerenchyma cells are dead at maturity.
- **Xylem** carries water and mineral ions mainly from roots toward leaves. Vessel elements and tracheids have strengthened walls and form conduits; transpiration and cohesion help draw water upward.
- **Phloem** transports sugars and other products of photosynthesis from sources, such as leaves, to areas that use or store them. Sieve-tube elements work with companion cells. Unlike the usual upward flow in xylem, phloem movement can travel in different directions in different tubes according to source and sink locations.

## Animal tissues

- **Epithelial tissue** covers body surfaces, lines organs and cavities, and forms many glands. Its cells can protect, absorb, or secrete. The small intestine has an epithelium specialized for nutrient absorption.
- **Connective tissue** supports, binds, protects, or transports. Examples include bone, cartilage, tendons, ligaments, adipose tissue, and blood. Its cells are often separated by an extracellular matrix.
- **Muscle tissue** contracts to produce movement. Skeletal muscle is generally under voluntary control, cardiac muscle contracts rhythmically in the heart, and smooth muscle moves materials through organs such as the intestine.
- **Nervous tissue** contains neurons that transmit electrical signals and supporting glial cells. It enables rapid communication and coordination throughout the body.

## Connecting tissue to organ function

An organ contains multiple tissue types working together. In a leaf, epidermis protects the surface, mesophyll performs most photosynthesis, and vascular bundles transport water and sugars. In the intestine, epithelial cells absorb nutrients, smooth muscle moves food, connective tissue supports the wall, and nervous tissue helps coordinate movement.

When comparing tissues, consider their cell structure, location, and function together. For example, xylem's hollow, strengthened conduits suit water transport and support, while phloem's living sieve tubes and companion cells suit the distribution of sugars. Tissue structure is evidence of the work that tissue performs.`,
  },
  "sistem-pencernaan-manusia": {
    title: "The Human Digestive System",
    description: "Follow food through the digestive tract, examine the roles of enzymes and accessory organs, and understand nutrient absorption and digestive health.",
    objectives: [
      "Trace the path of food and explain the roles of digestive and accessory organs.",
      "Analyze mechanical and chemical digestion of nutrients.",
      "Explain how digested nutrients are absorbed and transported.",
      "Relate eating habits and symptoms to digestive system function and health.",
    ],
    body: `# The Human Digestive System

## Why digestion is needed

Food contains molecules that are generally too large to be absorbed directly. The digestive system breaks them into smaller molecules, moves them through the intestinal wall into the blood or lymph, and removes undigested waste. Mechanical digestion breaks up and mixes food; chemical digestion uses enzymes to break molecular bonds.

## The path of food

**Mouth → pharynx → esophagus → stomach → small intestine (duodenum, jejunum, ileum) → large intestine → rectum → anus.** Peristalsis, a wave-like contraction of smooth muscle, moves food along the tract. During swallowing, the epiglottis helps direct food into the esophagus rather than the airway.

- **Mouth:** Teeth cut and grind food. The tongue mixes it with saliva and forms a bolus. Salivary amylase begins breaking starch into smaller sugars.
- **Esophagus:** Peristalsis moves the bolus toward the stomach. Little nutrient absorption occurs here.
- **Stomach:** Muscles churn food with gastric juice to form chyme. Hydrochloric acid creates an acidic environment, activates pepsin, and limits many swallowed microbes. Pepsin breaks proteins into shorter peptides. Mucus protects the stomach lining from acid and enzymes.
- **Small intestine:** The duodenum receives chyme, bile from the liver and gallbladder, and pancreatic juice. Bicarbonate helps neutralize stomach acid. Pancreatic enzymes digest carbohydrates, proteins, and fats; bile emulsifies fat into small droplets but is not itself an enzyme. Digestion and nutrient absorption continue through the jejunum and ileum.
- **Large intestine:** Water and some ions are absorbed. Gut microbes process some remaining material and produce certain vitamins. Waste becomes more solid before it is stored in the rectum and eliminated through the anus.

## Enzymes and accessory organs

Enzymes act on particular substrates. Amylase digests starch, proteases such as pepsin digest proteins, and lipase digests fats into smaller components. The **liver** produces bile and processes absorbed nutrients. The **gallbladder** stores and releases bile. The **pancreas** releases digestive enzymes and bicarbonate into the small intestine. These organs assist digestion even though food does not pass through them.

## Absorption and transport

The inner surface of the small intestine has folds, villi, and microvilli that greatly increase its surface area. Thin epithelial layers and a rich supply of capillaries support absorption. Many sugars and amino acids enter blood capillaries and travel to the liver through the hepatic portal vein. Most products of fat digestion enter lymphatic vessels called lacteals before reaching the bloodstream.

## Digestive health and reasoning

Balanced meals, adequate water, fiber, food hygiene, and regular physical activity support digestive health. Diarrhea can cause dangerous water and electrolyte loss; persistent abdominal pain, blood in stool, or prolonged changes in digestion require medical evaluation. A symptom alone does not identify a disease: its duration, severity, and other signs matter.

The main idea is that digestion combines movement, mechanical breakdown, chemical reactions, absorption, and waste removal. Each organ contributes a different step, while accessory organs provide substances that make digestion effective.`,
  },
  "sistem-pernapasan-manusia": {
    title: "The Human Respiratory System",
    description: "Explore ventilation, air volume, gas exchange in the alveoli, and how the respiratory and circulatory systems work together.",
    objectives: [
      "Trace the path of air through the respiratory system.",
      "Explain how pressure changes move air in and out of the lungs.",
      "Describe gas exchange in the alveoli and transport of respiratory gases.",
      "Analyze how environment and habits affect respiratory health.",
    ],
    body: `# The Human Respiratory System

## Ventilation and gas exchange

The respiratory system brings oxygen into the body and removes carbon dioxide. **Ventilation** moves air into and out of the lungs; **gas exchange** moves oxygen and carbon dioxide between air, blood, and tissues. These processes support cellular respiration but are not the same as cellular respiration itself, which occurs inside cells.

## The path of air

**Nose or mouth → pharynx → larynx → trachea → bronchi → bronchioles → alveoli.** The nose filters, warms, and moistens incoming air. The larynx contains the vocal cords. The trachea and larger airways are supported by cartilage; mucus and cilia help trap and move particles out. Bronchi branch into smaller bronchioles that lead to clusters of alveoli.

## How breathing works

During inhalation, the diaphragm contracts and flattens, and the external intercostal muscles lift the ribs. The chest cavity expands, pressure inside the lungs falls below atmospheric pressure, and air flows in. During quiet exhalation, these muscles relax, the chest volume decreases, pressure rises, and air flows out. Forced breathing recruits additional muscles.

Lung volumes describe different amounts of air. Tidal volume is the air moved in a normal breath. Residual volume remains after a maximal exhalation and helps prevent the lungs from collapsing. Vital capacity is the greatest volume that can be exhaled after a maximal inhalation. Measurements vary with body size, age, health, and activity.

## Gas exchange and transport

Alveoli provide a large, moist surface with thin walls and a dense capillary network. Oxygen diffuses from alveolar air into blood because of a partial-pressure gradient. Carbon dioxide diffuses in the opposite direction and is exhaled. Hemoglobin in red blood cells carries most oxygen; much carbon dioxide travels in blood as bicarbonate ions.

At body tissues, oxygen leaves the blood and enters cells, while carbon dioxide produced by cellular respiration enters the blood. Efficient exchange depends on ventilation, circulation, and the thin alveolar-capillary barrier working together.

## Respiratory health

Asthma narrows and inflames airways, which can make breathing difficult. Respiratory infections can affect different parts of the tract. Emphysema damages alveolar walls and reduces the available surface for gas exchange. Tobacco smoke, secondhand smoke, and air pollution increase the risk of airway and lung damage.

Regular exercise supports cardiorespiratory fitness but does not remove the effects of smoke or pollution. Avoiding smoke, improving indoor ventilation, using suitable protection when air quality is poor, and seeking medical care for severe shortness of breath are sensible steps.

In summary, pressure and volume changes ventilate the lungs, alveoli exchange oxygen and carbon dioxide, and blood transports these gases. Respiratory performance depends on healthy airways, alveoli, circulation, and environmental conditions.`,
  },
  "sistem-peredaran-darah-manusia": {
    title: "The Human Circulatory System",
    description: "Study the heart, blood vessels, blood components and types, and the pulmonary and systemic circuits that transport materials around the body.",
    objectives: [
      "Identify the roles of blood, the heart, and blood vessels.",
      "Trace blood flow through the heart, lungs, and body.",
      "Compare arteries, veins, and capillaries and explain double circulation.",
      "Use blood components and blood groups to reason about transport and compatibility.",
    ],
    body: `# The Human Circulatory System

## Components and functions

The circulatory system transports oxygen, carbon dioxide, nutrients, hormones, heat, and waste. It consists of the heart, blood, and blood vessels. Humans have a **closed, double circulation** system: blood stays within vessels and passes through the heart twice during one complete route through the lungs and body.

Blood plasma carries water, dissolved substances, hormones, and some wastes. Red blood cells contain hemoglobin that binds oxygen. White blood cells help defend the body against pathogens. Platelets and clotting proteins help limit blood loss after vessel damage.

## Heart structure and blood flow

The heart has four chambers. The right atrium receives oxygen-poor blood from the body; the right ventricle pumps it to the lungs through the pulmonary artery. Oxygen-rich blood returns by the pulmonary veins to the left atrium. The left ventricle pumps it through the aorta to the body. Valves help keep blood moving in one direction.

The **pulmonary circuit** carries blood between the heart and lungs, where gas exchange occurs. The **systemic circuit** carries blood between the heart and the rest of the body. The left ventricular wall is thicker than the right because it must generate more pressure to send blood around the body.

## Blood vessels

- **Arteries** carry blood away from the heart. Their thick, elastic walls withstand relatively high pressure. Most arteries carry oxygen-rich blood, but the pulmonary artery is an important exception.
- **Veins** return blood to the heart. Their walls are generally thinner, and many contain valves that help prevent backflow, especially in the limbs. Most veins carry oxygen-poor blood, but pulmonary veins are an exception.
- **Capillaries** have walls only one cell thick. Their narrow passages and large total surface area allow gases, nutrients, and wastes to exchange between blood and tissues.

## Blood groups and compatibility

The ABO system classifies red blood cells according to A and B antigens. The Rh factor is another important antigen. Before a transfusion, compatibility must be checked because antibodies can react with unfamiliar antigens and cause dangerous clumping or destruction of cells. Medical professionals use tested blood products and carefully follow compatibility procedures; simple labels should not replace clinical testing.

## Keeping the system healthy

Regular physical activity, balanced nutrition, avoiding tobacco, and appropriate health checks support cardiovascular health. High blood pressure can strain vessel walls and the heart over time. Atherosclerosis involves plaque buildup in arteries and can restrict blood flow. Chest pain, sudden weakness, or severe shortness of breath can be emergencies requiring immediate medical help.

The heart, vessels, and blood work as one transport network. Understanding the route of blood helps explain how oxygen reaches tissues, how carbon dioxide returns to the lungs, and why damage in one part of the system can affect the entire body.`,
  },
  "ekosistem-dan-interaksi": {
    title: "Ecosystems and Organism Interactions",
    description: "Analyze relationships between organisms and their environment, energy flow, ecosystem change, and conservation strategies.",
    objectives: [
      "Distinguish biotic and abiotic components of an ecosystem.",
      "Explain food chains, food webs, trophic levels, and the limits of energy transfer.",
      "Analyze interactions among organisms and predict effects of population changes.",
      "Connect biogeochemical cycles and human activities to ecosystem stability and conservation.",
    ],
    body: `# Ecosystems and Organism Interactions

## Ecosystem components

An ecosystem includes a community of organisms and the physical environment with which they interact. **Biotic factors** are living organisms and their effects. **Abiotic factors** include light, temperature, water, soil, pH, and nutrients. A change in one factor can affect survival, reproduction, and the distribution of many species.

## Energy flow and food relationships

Producers, such as plants and algae, capture energy, usually from sunlight, and store some of it in organic molecules. Consumers obtain energy by eating other organisms. Decomposers, including many fungi and bacteria, break down dead material and wastes, returning nutrients to the environment.

A food chain shows one path of energy transfer, for example **grass → grasshopper → frog → snake → hawk**. Real ecosystems contain many connected paths, forming a food web. Organisms occupy trophic levels, but an organism may feed at more than one level. Energy is lost at each transfer through metabolism, movement, and heat, so only a fraction is available to the next level. Matter, in contrast, is recycled.

Ecological pyramids represent numbers, biomass, or energy across trophic levels. The energy pyramid narrows toward higher levels because energy is not recycled back to producers. This helps explain why ecosystems usually support fewer top predators than organisms at lower levels.

## Interactions between organisms

- **Competition** occurs when organisms use the same limited resource.
- **Predation** benefits a predator while harming its prey; it can influence population sizes and behavior.
- **Mutualism** benefits both partners, as in many pollinator-flower relationships.
- **Commensalism** benefits one organism without a clear effect on the other.
- **Parasitism** benefits a parasite while harming its host.

These relationships can change when populations rise or fall. If a predator declines, prey numbers may increase and put greater pressure on plants. If a pollinator disappears, some plants may produce fewer seeds. Effects can spread through a food web rather than stopping with one pair of species.

## Nutrient cycles and change

Water, carbon, nitrogen, and other materials cycle between organisms and the environment. Plants take up water and mineral nutrients; consumers obtain them by feeding; decomposition returns many substances to soil, water, and air. Photosynthesis removes carbon dioxide from the atmosphere, while respiration and decomposition release it. Human activities such as burning fossil fuels, deforestation, and excessive fertilizer use can alter these cycles.

## Ecosystem balance and conservation

Ecosystems are dynamic, not perfectly fixed. Seasonal change, disturbances, and population fluctuations are natural, but rapid or severe pressures can reduce biodiversity and ecosystem resilience. Habitat protection, restoration, sustainable resource use, pollution reduction, and protection of native species can help ecosystems recover.

When evaluating an environmental change, identify the cause, predict which populations are affected directly, trace indirect effects through the food web, and consider how long recovery may take. This evidence-based approach is more useful than assuming that one population change has only one consequence.`,
  },
};

export function MaterialLearningContent({
  slug,
  title,
  description,
  objectives,
  color,
}: {
  slug: string;
  title: string;
  description: string;
  objectives: string;
  color: string;
}) {
  const { language } = useLanguage();
  const english = language === "en" ? englishMaterials[slug] : undefined;
  const displayTitle = english?.title ?? title;
  const displayObjectives = english?.objectives ?? objectives.split("\n").filter(Boolean);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900 dark:text-[#edf4e2]">{displayTitle}</h1>
          <p className="text-lg text-slate-600 dark:text-[#aab9a7]">{english?.description ?? description}</p>
        </div>
      </div>

      <section className="card-gradient mb-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-700"><span aria-hidden="true">✓</span></span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#edf4e2]">{language === "en" ? "Learning Objectives" : "Tujuan Pembelajaran"}</h2>
        </div>
        <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-[#d6e1d1]">
          {displayObjectives.map((objective, index) => <p key={index} className="flex items-start gap-2"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage-500" /><span>{objective}</span></p>)}
        </div>
      </section>
    </>
  );
}

export function MaterialArticle({ slug, title, content }: { slug: string; title: string; content: string }) {
  return <article className="card mb-8"><MaterialBody slug={slug} title={title} content={content} /></article>;
}

export function MaterialBody({ slug, title, content }: { slug: string; title: string; content: string }) {
  const { language } = useLanguage();
  const english = language === "en" ? englishMaterials[slug] : undefined;
  return (
    <div className="text-sm leading-relaxed text-slate-700 dark:text-[#d6e1d1]">
      <MarkdownContent text={english?.body ?? content} title={english?.title ?? title} />
    </div>
  );
}

export function MaterialObjectives({ slug, objectives }: { slug: string; objectives: string }) {
  const { language } = useLanguage();
  const english = language === "en" ? englishMaterials[slug] : undefined;
  const items = english?.objectives ?? objectives.split("\n").filter(Boolean);
  return <>{items.map((item, index) => <p key={index}>{item}</p>)}</>;
}
