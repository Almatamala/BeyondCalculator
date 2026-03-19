# BeyondCalculator - Calculadora de Piscolas

Calculadora mobile para juntas de piscola. Resuelve dos preguntas:

| Flujo | Pregunta | Input | Output |
|-------|----------|-------|--------|
| **Forward** | ¿Cuánto copete compramos? | Personas, vasos, nivel | Botellas de pisco, bebida y hielo |
| **Reverse** | ¿Cuántas piscolas nos saldrán? | Botellas disponibles, nivel, vaso | Total de vasos que salen |

## Tech Stack

- **React Native 0.81** con **Expo SDK 54** (New Architecture habilitada)
- **TypeScript 5.9**
- **Expo Router 6** (file-based routing)
- **NativeWind 4 / TailwindCSS 3** (styling parcial, la mayoria usa `StyleSheet`)
- **React Native Reanimated 4** (animaciones de transicion entre pasos)
- **React Compiler** habilitado via Expo experiments

## Arquitectura

```
app/calculator/index.tsx     # Pantalla principal — wizard de N pasos
components/calculator/      # Componentes de cada step
  UseCaseSelector           # Step 0: forward vs reverse
  ModeSelector              # Forward: todos lo mismo vs personalizado
  ReverseInputModeSelector   # Reverse: promos vs por separado
  PromoInput                # Reverse: cards de promo (pisco+bebida juntos)
  PromoExtraSelector        # Reverse: eso es todo vs añadir más sueltas
  BottleInput               # Reverse: card de botellas con CountPicker
  BebidaSizeModal           # Reverse: modal para elegir tamano de bebida
  ReverseResultCard         # Reverse: pantalla de resultado
  LevelPicker               # Modal de seleccion de nivel
  GlassSelector             # Tipo de vaso (rojo 473ml / vidrio 350ml)
  ResultCard                # Forward: tarjeta de resultado
  PersonList                # Forward: lista de personas (modo personalizado)
StepContainer               # Navegacion por pasos con animaciones slide
countPicker                 # Incremento/decremento con input directo
context/CalculatorContext    # Estado global (forward + reverse)
utils/calculations.ts       # Logica de calculo (forward + reverse)
types/calculator.ts          # Tipos compartidos
constants/drinks.ts          # Ratios, tamanos de botella, config de vasos
```

### Flujos

Un Step 0 global permite elegir entre ambos flujos. El wizard se arma dinámicamente.

- **Forward** (4 steps): Modo → Datos → Vaso → Resultado (botellas + clipboard)
- **Reverse** (steps dinámicos): Modo → [Promos → ¿Más?] o [Pisco → Bebida] → Hielo → Nivel+Personas → Vaso → Resultado

Ver [docs/flows.md](docs/flows.md) para detalle de cada step y [docs/design-decisions.md](docs/design-decisions.md) para las decisiones de diseno.

## Desarrollo

### Requisitos previos

- Node.js 18+
- Expo CLI (`npx expo`)
- Para dispositivo fisico: [Expo Go](https://expo.dev/go) o un [development build](https://docs.expo.dev/develop/development-builds/introduction/)

### Instalacion

```bash
npm install
```

### Iniciar en desarrollo

```bash
npx expo start
```

Opciones disponibles:
- **Android**: `npx expo start --android` o presionar `a` en la terminal
- **iOS**: `npx expo start --ios` o presionar `i` en la terminal
- **Web**: `npx expo start --web` o presionar `w` en la terminal
- **Tunnel**: `npx expo start --tunnel` para compartir el QR via ngrok (util cuando el dispositivo no esta en la misma red)

### Build de produccion

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

### Linting

```bash
npm run lint
```

### Tests

```bash
npm test
```

Los tests cubren exclusivamente la lógica de cálculo (`utils/calculations.ts`) y corren en Node con Jest + ts-jest, sin ninguna dependencia de React Native.

#### Qué se testea

**`usableVolume`** — volumen líquido disponible después de aplicar el fill ratio (90%) y descontar el hielo por vaso (120ml).

**`calculateResults` — flujo forward**

- Modo *same*: verifica los tres niveles de pisco (algo piola, normal, 'algo piola', desquiciado, personalizado) con distintas combinaciones de personas/vasos y que los resultados escalen linealmente.
- Modo *personalized*: suma correctamente las contribuciones de cada persona con su propio nivel y vasos.

**`calculateReverseResults` — flujo reverse**

- Modo *separate*: el factor limitante (pisco, bebida o hielo) se detecta correctamente; se valida el uso de múltiples entradas de botella, botellas parciales (`percentageFull`), entrada directa de ml de bebida, modo de hielo manual vs auto, y el split de vasos por persona con leftover.
- Modo *promos*: `done` (solo ml de promos) y `add_more` (promos + botellas sueltas), incluyendo múltiples entradas de promo.
- **Lógica de sugerencias**: qué botella de bebida o cuántas bolsas de hielo comprar para aprovechar el pisco disponible.
  - Bebida: se sugiere la botella más pequeña que cubra el shortfall, salvo que el sobrante sea menor al 25% de la botella piso (en ese caso se queda con la piso).
  - Hielo: se redondea hacia arriba salvo que el resto sea menor al 25% de una bolsa.
  - Empate pisco/bebida: se reporta `"bebida"` como factor limitante y no se emite sugerencia.
