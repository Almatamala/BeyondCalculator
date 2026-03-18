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
