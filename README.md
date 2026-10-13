hello this is a thing that im going to try and vibe code.




# FTC Builder

**A virtual robotics workbench for designing, assembling, and validating FIRST Tech Challenge robots.**

FTC Builder is a browser-based 3D robotics design platform that makes building an FTC robot digitally as intuitive as assembling one on a physical workbench. Instead of manually downloading STEP files, importing individual components into traditional CAD software, positioning parts, and configuring assembly constraints, teams can construct complete robots by dragging, positioning, and fastening virtual components together.

The goal is to make robot design more accessible to new FTC teams while providing experienced teams with a practical environment for prototyping, testing, and refining their mechanisms before manufacturing or assembling the physical robot.

## Vision

FTC Builder transforms robot design from a traditional CAD workflow into an interactive, physics-aware assembly experience. Users work with a library of real FTC-compatible components, including structural channels, plates, brackets, quad blocks, screws, nuts, bolts, shafts, bearings, motors, gears, wheels, and other mechanical and electrical components.

Every component has accurate dimensions, geometry, attachment points, and relevant mechanical properties. Components are designed to interact according to their real-world physical constraints, allowing users to assemble mechanisms using intuitive interactions instead of manually configuring complex CAD relationships.

## How It Works

### 1. Interactive 3D Workbench

Users enter a three-dimensional workspace where they can freely navigate, inspect, and assemble their robot.

The workbench supports:
- Orbiting, panning, and zooming around the assembly.
- Selecting, moving, rotating, duplicating, and deleting components.
- Snapping components into compatible positions.
- Inspecting parts from different angles.
- Organizing assemblies and subassemblies.
- Viewing dimensions and component information.
- Undoing and redoing design changes.

The interface prioritizes direct manipulation, making the experience approachable for students with little or no CAD experience.

### 2. Component Library

The application provides a searchable library of FTC robotics components from supported manufacturers.

Components include:
- U-channels, plates, brackets, and structural elements.
- Quad blocks, standoffs, and mounting hardware.
- Screws, nuts, bolts, washers, and spacers.
- Motors, gearboxes, shafts, bearings, and couplers.
- Wheels, sprockets, gears, chains, and belts.
- Intake components, rollers, and compliant or Gecko wheels where supported.
- Sensors, control hubs, batteries, wiring accessories, and other robot electronics.

Each component includes its 3D geometry, dimensions, mounting-hole patterns, connection points, and relevant compatibility information.

The library is designed to support accurate components from official manufacturer CAD data where available, supplemented by validated custom models when necessary. Manufacturer trademarks and models are handled appropriately.

### 3. Intelligent Assembly System

The assembly engine understands how components fit together.

When a user moves a U-channel toward a compatible bracket, the application identifies potential mounting positions and snaps the components into alignment. Compatible holes and attachment points are recognized automatically.

Users can then select appropriate fasteners, insert them into aligned holes, and secure the components together.

The assembly system supports:
- Automatic alignment of compatible mounting holes.
- Geometric snapping and alignment guides.
- Fastener selection based on hole dimensions and supported hardware.
- Mechanical connections that preserve relative part positions.
- Rigid assemblies and supported rotational or sliding joints.
- Movement of connected assemblies as a unit.
- Detection of invalid connections and incompatible components.
- Assembly trees that show how individual parts form larger mechanisms.

The system must distinguish visual alignment from a physically valid connection. Components should only snap together when their geometry and connection rules permit it.

### 4. Mechanism and Drivetrain Builder

Users can construct complete mechanisms from individual components.

For example, a drivetrain can be built by mounting motors to structural channels, attaching shafts and bearings, installing wheels, and connecting the components with appropriate hardware.

The same workflow can be used to construct:
- Four-wheel and other supported drivetrains.
- Tank and mecanum drivetrains.
- Intake mechanisms using rollers and Gecko wheels.
- Linear slides and extension mechanisms.
- Lifts, arms, and other articulated mechanisms.
- Gear-driven, chain-driven, and belt-driven assemblies.

Prebuilt templates may be provided for common mechanisms, but users can modify them or build their own from scratch.

Each mechanism should retain its underlying component structure, connections, and relevant mechanical properties.

### 5. Robot Validation and Analysis

As a design progresses, FTC Builder helps users identify problems before constructing the physical robot.

Validation features include:
- Collision detection between components.
- Clearance checks between moving mechanisms.
- Identification of unsupported or disconnected components.
- Overall robot dimensions and bounding-box measurements.
- Estimated robot mass based on component data.
- Center-of-mass estimates when sufficient physical data is available.
- Identification of potentially incompatible mounting hardware.
- Mechanism movement previews for supported joints.
- Checks against configurable robot-size constraints and applicable FTC rules.

Validation results should distinguish confirmed violations from warnings and estimates. Users should be able to inspect the reasons behind each warning rather than receiving unexplained error messages.

Official competition requirements must be maintained by season, and the application should not claim that a robot is competition-legal solely because it passes automated checks.

### 6. Interactive Mechanism Simulation

Supported mechanisms can be animated and tested within the virtual environment.

Users can rotate wheels, operate simulated motors, move articulated arms, extend linear slides, and observe how connected components interact.

The long-term goal is to provide useful engineering feedback about:
- Movement ranges and mechanical clearances.
- Gear ratios and output speed.
- Approximate drivetrain behavior.
- Motor placement and mechanical interference.
- Potential mechanical bottlenecks.

Simulation fidelity depends on the available component data and physics models. Unsupported or unmodeled effects should be identified rather than presented as physically accurate results.

### 7. Project Management and Collaboration

Users can create, name, organize, save, duplicate, and revisit robot designs.

Projects preserve the complete assembly structure, including component identities, positions, rotations, connections, fasteners, and relevant configuration data.

Planned cloud features include:
- User accounts and project ownership.
- Saving and loading designs across devices.
- Sharing projects with teammates and mentors.
- Read-only project links.
- Collaborative design workflows.
- Version history and restoration of previous designs.
- Importing and exporting supported project formats.

The application should support local project storage or export independently of cloud accounts wherever practical.

### 8. Export and Real-World Building

FTC Builder is intended to help teams move from digital design to physical construction.

Planned export capabilities include:
- Bill of materials with component quantities.
- Component and hardware lists.
- Assembly hierarchy and construction instructions.
- Overall dimensions and selected measurements.
- Supported 3D model exports.
- Project files that preserve the complete assembly.
- Manufacturing exports for compatible custom parts.

Export support will depend on the geometry engine and available formats. Where feasible, the application may integrate with external CAD tools or generate standard formats such as STEP through an appropriate geometry kernel or conversion workflow.

The resulting documentation should help teams identify which components they need, how the robot is assembled, and where individual parts belong.

### 9. FTC Programming and Robotics Integration

Future versions may connect mechanical designs to robot programming workflows.

Potential features include:
- Assigning motors, servos, and sensors to logical robot hardware configurations.
- Mapping physical mechanisms to FTC hardware names.
- Generating configuration documentation for the FTC SDK.
- Exporting supported motor and sensor mappings.
- Providing mechanism previews alongside Java-based robot code.
- Integrating with simulation environments where supported.

The application is not intended to replace the official FTC SDK or automatically guarantee that generated code works on a physical robot. Programming integrations should use documented interfaces and clearly communicate their limitations.

## Technology Stack

The proposed architecture uses:

- **React and TypeScript** for the user interface and application logic.
- **Three.js and React Three Fiber** for interactive 3D rendering.
- **A dedicated geometry and assembly layer** for component snapping, constraints, joints, and collision detection.
- **A structured component library** containing validated geometry, dimensions, attachment points, and compatibility metadata.
- **JSON-based project serialization** for saving and loading robot assemblies.
- **Vercel** for hosting and deploying the web application.
- **Supabase** for planned authentication, cloud project storage, and collaboration features.

The assembly engine should be modular, allowing geometry processing, rendering, component metadata, project storage, and simulation to evolve independently.

The browser should handle interactive assembly operations locally whenever possible. Backend services should be used for features that genuinely require persistent storage, authentication, collaboration, or server-side processing.

## Design Principles

FTC Builder follows several core principles:

1. **Accessibility:** New students should be able to build a simple drivetrain without needing prior CAD experience.
2. **Physical accuracy:** Component dimensions and connections should reflect real hardware as closely as supported data permits.
3. **Intuitive interaction:** Users should interact with components directly rather than constantly managing complex CAD constraints.
4. **Modularity:** Individual parts, mechanisms, and complete robots should remain organized and reusable.
5. **Transparency:** Validation and simulation results should communicate their assumptions and limitations.
6. **Practicality:** Designs should help teams build real robots, not merely create visually impressive models.
7. **Incremental development:** Features should be implemented and tested independently before the application expands into more advanced simulation and collaboration.

## Long-Term Goal

FTC Builder aims to become a complete digital robotics workbench for FIRST Tech Challenge teams: a place where students can design mechanisms, assemble robots, test their designs, identify engineering problems, prepare construction documentation, and collaborate with teammates before touching the physical robot.

By combining the intuitive experience of a building game with the precision of engineering software, FTC Builder seeks to make robot design easier to learn, faster to iterate, and more accessible to teams of all experience levels.

**Design digitally. Build confidently. Compete smarter.**