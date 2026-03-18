# Flujos de la calculadora

## Step 0 — Selector de use-case (compartido)

El usuario elige entre los dos flujos. Auto-avanza al seleccionar.

---

## Flujo Forward: "¿Cuánto copete compramos?"

**Objetivo:** dado cuánto quieren tomar, decir qué comprar.

### Steps

1. **Modo** — "Todos lo mismo" vs "Personalizado"
2. **Datos** — Personas, vasos por persona, nivel (o lista personalizada)
3. **Vaso** — Vaso rojo (473ml) o vaso vidrio (350ml). Auto-avanza.
4. **Resultado** — Botellas de pisco, bebida y bolsas de hielo. Botón copiar al clipboard.

### Calculo

```ts
// utils/calculations.ts — calculateResults()
volPerDrink = usableVolume(glassMl)          // glassMl * 0.9 - 120 (hielo)
liquorMl    = totalDrinks * volPerDrink * ratio.liquor
bebidaMl    = totalDrinks * volPerDrink * ratio.soda
iceMl       = totalDrinks * 120
```

El resultado se divide por tamaño de botella elegido. Si la fracción sobrante es <= 25%, se redondea hacia abajo y se muestra notificación de shortage.

---

## Flujo Reverse: "¿Cuántas piscolas nos saldrán?"

**Objetivo:** dado lo que tienen, decir cuántos vasos salen.

### Steps (dinámicos)

1. **Modo de ingreso** — "Ingresar Promos" vs "Ingresar Pisco y bebida por separado". Auto-avanza.

**Si elige Promos:**

2. **Promos** — Cards de promo. Cada card tiene: tamaño pisco (750ml/1L), tamaño bebida (1L/1.5L/2L/3L), cantidad. Sin lockout de tamaños. Defaults: pisco 1L, bebida 1.5L. Primera card no se puede borrar.
3. **¿Algo más?** — "Eso es todo" vs "Añadir más botellas sueltas". Auto-avanza.
   - Si "Eso es todo": salta directo a Hielo.
   - Si "Añadir más": resetea entries a `[]`, continua a Pisco y Bebida sueltos (los mL de promos se suman a los de botellas).
4. _(condicional)_ **Pisco suelto** — Empty state si no hay entries (permite avanzar con 0 botellas). Cada card = 1 botella individual (sin CountPicker, sin lockeo de tamaños, duplicados OK). Selector de porcentaje (100%/75%/50%/25%/personalizado) para botellas parciales.
5. _(condicional)_ **Bebida suelta** — Igual que Pisco suelto: empty state, botella individual con porcentaje.

**Si elige Por separado:**

2. **Pisco** — Cards de botellas con CountPicker. Tamaños: 750ml, 1L. Máximo 2 cards.
3. **Bebida** — Dos modos: "Por botellas" (cards, max 4 tamaños) o "Directo en litros" (input + toggle mL/L).

**Pasos finales (ambos caminos):**

- **Hielo** — "Por bolsas" (CountPicker de bolsas de 1kg) o "Que alcance nomás" (omite hielo del cálculo).
- **Nivel + Personas** — LevelPicker + CountPicker.
- **Vaso** — Mismo GlassSelector. Auto-avanza.
- **Resultado** — Total de vasos, ratio, división por persona, mensaje de sobras.

### Calculo

```ts
// utils/calculations.ts — calculateReverseResults()
// Promos aportan mL de pisco y bebida
promoPiscoMl  = sum(promos.piscoSizeMl * promos.count)
promoBebidaMl = sum(promos.bebidaSizeMl * promos.count)

// Botellas sueltas (solo si mode es "separate" o promoExtra es "add_more")
bottlePiscoMl  = sum(piscoEntries.sizeMl * entries.count * (percentageFull ?? 100) / 100)
bottleBebidaMl = sum(bebidaEntries * percentage) o directMl

totalPiscoMl  = promoPiscoMl + bottlePiscoMl
totalBebidaMl = promoBebidaMl + bottleBebidaMl
totalIceMl    = iceKg * 1090          // solo si modo "manual"

drinksFromPisco  = totalPiscoMl  / (volPerDrink * ratio.liquor)
drinksFromBebida = totalBebidaMl / (volPerDrink * ratio.soda)
drinksFromIce    = totalIceMl    / 120

totalDrinks = floor(min(drinksFromPisco, drinksFromBebida, [drinksFromIce]))
```

El ingrediente limitante (el que se acaba primero) determina el total. Si hielo es "auto", se excluye del min.

### BottleInput: dos modos de uso

**Modo grupo (por separado):** Cada card = un tamaño con CountPicker de cantidad. Los tamaños se lockean al haber >1 card para evitar duplicados.
- Pisco: máx 2 cards (750ml, 1L).
- Bebida: máx 4 cards. Modal filtra tamaños ya usados.

**Modo botella individual (sueltas desde promos):** Cada card = 1 botella física con tamaño + porcentaje de llenado. Sin CountPicker, sin lockeo, duplicados permitidos. Máx 5 cards.

- **Promos:** Sin lockout. Todos los tamaños siempre editables independientemente de cuántas cards haya.

---

## Navegacion

- Step 0 es el entry-point global.
- Back desde step 1 vuelve a step 0 y resetea estado (con warning si hay datos en forward).
- "Empezar de nuevo" desde cualquier resultado vuelve a step 0.
- Los steps se construyen dinámicamente según `state.useCase`.
- `SlideProgress` refleja la cantidad de steps del flujo activo.
