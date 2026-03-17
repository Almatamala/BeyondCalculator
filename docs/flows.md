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

### Steps

1. **Pisco** — Cards de botellas con CountPicker. Tamaños: 750ml, 1L. Máximo 2 cards.
2. **Bebida** — Dos modos: "Por botellas" (cards, max 4 tamaños) o "Directo en litros" (input + toggle mL/L).
3. **Hielo** — "Por bolsas" (CountPicker de bolsas de 1kg) o "Que alcance nomás" (omite hielo del cálculo).
4. **Nivel + Personas** — LevelPicker + CountPicker.
5. **Vaso** — Mismo GlassSelector. Auto-avanza.
6. **Resultado** — Total de vasos, ratio, división por persona, mensaje de sobras.

### Calculo

```ts
// utils/calculations.ts — calculateReverseResults()
totalPiscoMl  = sum(entries.sizeMl * entries.count)
totalBebidaMl = sum(entries) o directMl
totalIceMl    = iceKg * 1090          // solo si modo "manual"

drinksFromPisco  = totalPiscoMl  / (volPerDrink * ratio.liquor)
drinksFromBebida = totalBebidaMl / (volPerDrink * ratio.soda)
drinksFromIce    = totalIceMl    / 120

totalDrinks = floor(min(drinksFromPisco, drinksFromBebida, [drinksFromIce]))
```

El ingrediente limitante (el que se acaba primero) determina el total. Si hielo es "auto", se excluye del min.

### Lockeo de tamaños en BottleInput

- **Pisco (2 tamaños):** Con 1 card los pills son interactivos. Al agregar la 2a card, ambas se lockean (pill fijo, sin cambio).
- **Bebida (4 tamaños):** Con 1 card los pills son interactivos. Al agregar más cards, cada una muestra su tamaño fijo. Nuevos tamaños se eligen desde un modal que excluye los ya usados.

---

## Navegacion

- Step 0 es el entry-point global.
- Back desde step 1 vuelve a step 0 y resetea estado (con warning si hay datos en forward).
- "Empezar de nuevo" desde cualquier resultado vuelve a step 0.
- Los steps se construyen dinámicamente según `state.useCase`.
- `SlideProgress` refleja la cantidad de steps del flujo activo.
