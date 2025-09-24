import React, { useState, useEffect } from "react";
import { FaSolarPanel, FaBatteryFull, FaTimesCircle } from "react-icons/fa";
import { GiPowerGenerator } from "react-icons/gi";
import { AiFillDatabase } from "react-icons/ai";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

function App() {
  const [mode, setMode] = useState("");        // "Hybrid" or "Off-Grid"
  const [value, setValue] = useState("");      // Genset kWm or Electricity kWh
  const [confirmed, setConfirmed] = useState(false);

  // step 2: hybrid
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");
  const [average, setAverage] = useState("");
  const [phase, setPhase] = useState("");
  const [operatingM, setOperatingM] = useState("");
  const [kva, setKva] = useState("");
  const [operatingHours, setOperatingHours] = useState(8);
  useEffect(() => {
    if (rangeMin && rangeMax) {
      setAverage(((Number(rangeMin) + Number(rangeMax)) / 2).toFixed(1));
    }
  }, [rangeMin, rangeMax]);
  const [showPresets, setShowPresets] = useState(false);
  const [gensetLiters, setGensetLiters] = useState("");
  const [showEstimateMsg, setShowEstimateMsg] = useState(false);

  // step 2: off-grid
  const [hasGenset, setHasGenset] = useState(null); // for backup genset
  const [errorMessage, setErrorMessage] = useState("");  

  // Custom Appliance
  const [customText, setCustomText] = useState(
    "1. Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n2. Refrigerator – Medium – 1 unit – 24 hours/day\n\nPlease calculate the kWh/day for these appliances"
  );
  const [copyMessage, setCopyMessage] = useState("");

  // step 3: hybrid
  const [dieselSaving, setDieselSaving] = useState(0); // % saving from genset

  // Auto update based on mode
  useEffect(() => {
    if (mode === "Hybrid") {
      setDieselSaving(50);
    } else if (mode === "Standby") {
      setDieselSaving(100);
    }
  }, [mode]);

  // step 3: off-grid

  // Step 1: Select mode
  if (!mode) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
        <h2>Select your system type</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column", // 👈 stack vertically instead of side by side
            alignItems: "center",
            gap: "20px", // spacing between buttons
            marginTop: "20px",
          }}
        >
          
          {/* Hybrid Button */}
          <button
            onClick={() => setMode("Hybrid")}
            style={{
              width: 250,
              height: 150,
              padding: "15px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "12px",
              border: "1px solid #ccc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              color: "#fff",
              backgroundColor: "#007BFF",
            }}
          >
            <strong>Solar + Battery <br /> + Genset (Hybrid Mode)</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <AiFillDatabase size={40} />
              <GiPowerGenerator size={40} />
            </div>
          </button>

          {/* Standby Button */}
          <button
            onClick={() => setMode("Standby")}
            style={{
              width: 250,
              height: 150,
              padding: "15px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "12px",
              border: "1px solid #ccc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              color: "#fff",
              backgroundColor: "#6A5ACD",
            }}
          >
            <strong>Solar + Battery + Genset (Standby)</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <AiFillDatabase size={40} />
              <GiPowerGenerator size={40} />
            </div>
          </button>

          {/* Off-Grid Button */}
          <button
            onClick={() => setMode("Off-Grid")}
            style={{
              width: 250,
              height: 150,
              padding: "15px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "12px",
              border: "1px solid #ccc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              background: "#fff",
              backgroundColor: "#FF8C00",
            }}
          >
            <strong>Solar + Battery (Off-Grid)</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <AiFillDatabase size={40} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", color: "#D2042D" }}>
              <FaTimesCircle /> <strong>No TNB</strong>
            </div>
          </button>
        </div>
        </motion.div>
      </div>
    );
  }

  // Step 2: Ask user-specific input
  if (!confirmed) {
    return (
      <div style={styles.container}>
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ position: "relative", minHeight: "50px" }}>
            {/* Back button at top-left */}
            <button
              style={{
                position: "absolute",
                left: "10px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                cursor: "pointer",
                background: "#f5f5f5",
              }}
              onClick={() => {
                // reset everything
                setMode("");
                setPhase("");
                setOperatingM("");
                setRangeMin("");
                setRangeMax("");
                setAverage("");
                setKva("");
                setValue("");
                setHasGenset(null);
                setErrorMessage("")
                setOperatingHours(8)
                setGensetLiters("")
                setCustomText(
                  "1. Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n2. Refrigerator – Medium – 1 unit – 24 hours/day\n\nPlease calculate the kWh/day for these appliances"
                );
              }}
            >
              ← Back
            </button>
          </div>


        <h2>{mode} Mode System Setup</h2>

        {mode === "Hybrid" || mode === "Standby"? (
          <>
            <div style={styles.card}>
              <p>Please select your genset phase first:</p>
              
              {/* Phase Selection */}
              <div style={{ marginTop:"10px"}}>
                <label>
                  <input
                    type="radio"
                    name="phase"
                    value="single"
                    checked={phase === "single"}
                    onChange={(e) => setPhase(e.target.value)}
                  />{" "}
                  Single Phase
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name="phase"
                    value="three"
                    checked={phase === "three"}
                    onChange={(e) => setPhase(e.target.value)}
                  />{" "}
                  Three Phase
                </label>
              </div>
            </div>

            {/* Show genset details only if phase is selected */}
            {phase && (
              <>
              <br />
                <p style={{ textAlign:"center", marginTop: "15px" }}><strong>Please enter your genset details</strong>:</p>
                
                <div style={styles.card}>
                  {/* NEW: Genset Liters Input */}
                  <div style={{ textAlign:"center", marginTop: "15px" }}>
                    <label>
                      Genset Fuel Capacity (Liters):
                    </label>
                    <input
                      type="number"
                      value={gensetLiters}
                      onChange={(e) => setGensetLiters(e.target.value)}
                      style={{
                        ...styles.input, 
                        marginTop:"8px",
                        textAlign:"center",}}
                      placeholder="Enter genset liters"
                    />
                  </div>

                  {/* Operating Hours Slider */}
                  <div style={{ marginTop: "15px" }}>
                    <label>
                      Operating Hours: <b>{operatingHours}h</b>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(Number(e.target.value))}
                        style={{ width: "100%" }}
                      />
                    </label>
                  </div>
                  
                  {/* Auto Calculate Button */}
                  <div style={{ textAlign: "center", marginTop: "5px" }}>
                    <button
                      onClick={() => {
                        if (!gensetLiters) return;

                        // --- Assumptions ---
                        // 0.25 L/kWh diesel consumption
                        // 8 hours runtime
                        // PF = 0.85
                        const kWh = gensetLiters / 0.25; 
                        const estimatedKW = kWh / operatingHours; // assume 8h runtime
                        const estimatedKVA = estimatedKW / 0.85;

                        let Imax = 0;
                        if (phase === "three") {
                          // Three-phase @ 400V
                          Imax = (1000 * estimatedKVA) / (Math.sqrt(3) * 400);
                        } else {
                          // Single-phase @ 230V
                          Imax = (1000 * estimatedKVA) / 230;
                        }

                        const Imin = Imax * 0.3; // assume min 30% load
                        const Iavg = (Imax + Imin) / 2;

                        // Update states
                        setOperatingM(Math.round(Iavg));
                        setRangeMin(Math.round(Imin));
                        setRangeMax(Math.round(Imax));
                        setAverage(Math.round(Iavg));
                        setKva(Math.round(estimatedKVA)); // convert to kVA
                      
                      // Show confirmation text
                      setShowEstimateMsg(true);

                      // Hide it after 3 seconds
                      setTimeout(() => setShowEstimateMsg(false), 2500);
                      }}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32",
                        fontWeight: "bold",
                        marginTop: "10px",
                      }}
                    >
                      🔍 Estimate Amps from Liters
                    </button>

                    {/* Confirmation Text */}
                    {showEstimateMsg && (
                      <p style={{ marginTop: "10px", color: "#2e7d32", fontWeight: "bold" }}>
                        ✅ Estimated values have been filled in!
                      </p>
                    )}
                  </div>
                </div>

                <h3>OR</h3>

                <div style={styles.card}>
                  {/* Quick Presets Dropdown */}
                  <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <button
                      onClick={() => setShowPresets(!showPresets)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        backgroundColor: "#f5f5f5",
                        fontWeight: "bold",
                      }}
                    >
                      💡 Quick Presets {showPresets ? "▲" : "▼"}
                    </button>

                    {showPresets && (
                      <div style={{ marginTop: "15px" }}>
                        <p style={{ fontSize: "14px", color: "#555", marginBottom: "15px" }}>
                          These buttons let you quickly fill in common load scenarios.
                        </p>

                        <div
                          style={{
                            display: "grid",
                            justifyContent: "center",
                            // gap: "20px",
                            // marginBottom: "15px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            style={{ ...styles.modeButton, backgroundColor: "#4caf50", minwidth:"150px", }}
                            onClick={() => {
                              setKva(25);
                              setOperatingM(18);
                              setRangeMin(15);
                              setRangeMax(22);
                              setAverage(18.5);
                            }}
                          >
                            Small Usage <br />
                            <span style={{ fontSize: "12px"}}>(Shops / Small Offices)</span>

                          </button>

                          <button
                            style={{ ...styles.modeButton, backgroundColor: "#2196f3", minWidth:"150px", }}
                            onClick={() => {
                              setKva(80);
                              setOperatingM(60);
                              setRangeMin(55);
                              setRangeMax(70);
                              setAverage(60);
                            }}
                          >
                            Medium Usage <br />
                            <span style={{ fontSize: "12px"}}>(Restaurant / School / Factory Section)</span>
                          </button>

                          <button
                            style={{ ...styles.modeButton, backgroundColor: "#f44336", minWidth: "150px", }}
                            onClick={() => {
                              setKva(200);
                              setOperatingM(150);
                              setRangeMin(120);
                              setRangeMax(180);
                              setAverage(150);
                            }}
                          >
                            High Usage <br />
                            <span style={{ fontSize: "12px" }}>(Large Factory / Hotel / Hospital)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Operating Amps */}
                  <div style={{ display: "block", marginTop: "15px", textAlign:"center" }}>
                    <label>
                      Operating Amps:
                    </label>
                    <input
                      type="number"
                      value={operatingM}
                      onChange={(e) => setOperatingM(e.target.value)}
                      style={{
                          ...styles.input, 
                          marginTop:"8px",
                          textAlign:"center",}}
                      placeholder="Enter operating Amps"
                    />
                  </div>

                  {/* Range Min */}
                  <div style={{ display: "block", marginTop: "15px", textAlign: "center" }}>
                    <label>
                      Range Min (Amps):
                    </label>
                    <input
                      type="number"
                      value={rangeMin}
                      onChange={(e) => setRangeMin(e.target.value)}
                      style={{
                          ...styles.input, 
                          marginTop:"8px",
                          textAlign:"center",}}
                      placeholder="Enter minimum Amps"
                    />
                  </div>

                  {/* Range Max */}
                  <div style={{ display: "block", marginTop: "15px", textAlign:"center" }}>
                    <label>
                      Range Max (Amps):
                    </label>
                    <input
                      type="number"
                      value={rangeMax}
                      onChange={(e) => setRangeMax(e.target.value)}
                      style={{
                            ...styles.input, 
                            marginTop:"8px",
                            textAlign:"center",}}
                      placeholder="Enter maximum Amps"
                    />
                  </div>

                  {/* Average */}
                  <div style={{ display: "block", marginTop: "15px", textAlign:"center" }}>
                    <label>
                      Average (Amps):
                    </label>
                    <input
                      type="number"
                      value={average}
                      readOnly
                      style={{
                        ...styles.input,
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>

                  {/* kVA */}
                  <div style={{ display: "block", marginTop: "15px", textAlign:"center" }}>
                    <label>
                      Genset Rating (kVA):
                    </label>
                    <input
                      type="number"
                      value={kva}
                      onChange={(e) => setKva(e.target.value)}
                      style={{
                            ...styles.input, 
                            marginTop:"8px",
                            textAlign:"center",}}
                      placeholder="Enter genset kVA"
                    />
                  </div>

                  {/* Operating Hours Slider */}
                  <div style={{ display: "block", marginTop: "15px", textAlign: "center" }}>
                    <label>
                      Operating Hours per Day: <b>{operatingHours}h</b>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(Number(e.target.value))}
                        style={{ width: "80%", marginTop: "10px" }}
                      />
                    </label>
                  </div>

                  {/* Clear Button */}
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                      onClick={() => {
                        setOperatingM("");
                        setRangeMin("");
                        setRangeMax("");
                        setAverage("");
                        setKva("");
                        setOperatingHours(8);
                      }}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        backgroundColor: "#ffebee",
                        color: "#d32f2f",
                        fontWeight: "bold",
                      }}
                    >
                      🧹 Clear All
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p>Please enter your electricity demand per day (in kWh):</p>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={styles.input}
              placeholder="Enter electricity (kWh)"
            />

            <h3>OR</h3>

            <div style={styles.card}>
              <h4>📝 Custom Appliance List</h4>
              <p>You can type or paste your appliances here.</p>

              <textarea
                style={{
                  width: "90%",
                  height: "120px",
                  padding: "10px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                }}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />

              <div style={{display: "flex", justifyContent: "center", gap:"10px"}}>
              {/* Copy Button */}
                <button
                  style={styles.helpButton}
                  onClick={() => {
                    navigator.clipboard.writeText(customText);
                    setCopyMessage("✅ Custom list copied! Paste it into ChatGPT to calculate.");
                    setTimeout(() => setCopyMessage(""), 3000); // Auto hide after 3s
                  }}
                >
                  📋 Copy Text
                </button>

                {/* NEW Ask ChatGPT Button */}
                <button
                  style={{ ...styles.helpButton, marginLeft: "10px", backgroundColor: "#10a37f" }}
                  onClick={() => {
                    const chatGPTUrl = `https://chat.openai.com/?q=${encodeURIComponent(customText)}`;
                    window.open(chatGPTUrl, "_blank");
                  }}
                >
                  🤖 Ask ChatGPT
                </button>
              </div>

              {copyMessage && (
                <p style={{ color: "green", fontSize: "14px", marginTop: "8px" }}>
                  {copyMessage}
                </p>
              )}
            </div>
          </>
        )}

          {/* Main content (Confirm + Error Message) */}
          <div style={{ textAlign: "center"}}>
            {/* Show error message */}
            {errorMessage && (
              <p style={{ color: "red"}}>{errorMessage}</p>
            )}

            <button
              style={styles.modeButton}
              onClick={() => {
                if (mode === "Hybrid" || mode === "Standby") {
                  if (!phase) {
                    setErrorMessage("⚠️ Please select a genset phase.");
                    return;
                  }
                  if (!operatingM) {
                    setErrorMessage("⚠️ Please enter operating Amps.");
                    return;
                  }
                  if (!rangeMin) {
                    setErrorMessage("⚠️ Please enter the minimum Amps.");
                    return;
                  }
                  if (!rangeMax) {
                    setErrorMessage("⚠️ Please enter the maximum Amps.");
                    return;
                  }
                  if (!average) {
                    setErrorMessage("⚠️ Please enter the average Amps.");
                    return;
                  }
                  if (!kva) {
                    setErrorMessage("⚠️ Please enter the genset rating (kVA).");
                    return;
                  }
                  if(!operatingHours){
                    setErrorMessage("⚠️ Please enter the operating hour.");
                    return;
                  }
                  // ✅ Guardrails
                   if (Number(operatingM) <= 0) {
                    setErrorMessage("⚠️ Operating Amps cannot be negative.");
                    return;
                  }
                  if (Number(kva) <= 0) {
                    setErrorMessage("⚠️ Genset rating (kVA) must be greater than 0.");
                    return;
                  }
                  if (Number(rangeMin) < 0 || Number(rangeMax) < 0 || Number(average) < 0) {
                    setErrorMessage("⚠️ Load values cannot be negative.");
                    return;
                  }
                  if (Number(rangeMin) > Number(rangeMax)) {
                    setErrorMessage("⚠️ Minimum Amps cannot be greater than Maximum Amps.");
                    return;
                  }
                  if (Number(average) < Number(rangeMin) || Number(average) > Number(rangeMax)) {
                    setErrorMessage("⚠️ Average Amps must be between Min and Max.");
                    return;
                  }
                  if (Number(operatingHours) <= 0 || Number(operatingHours) > 24) {
                    setErrorMessage("⚠️ Operating hour must be between 1 and 24.");
                    return;
                  }
                } else {
                  if (!value) {
                    setErrorMessage("⚠️ Please enter your electricity usage (kWh).");
                    return;
                  }
                }

                // If everything is filled, clear error and confirm
                setErrorMessage("");
                setConfirmed(true);

                // ✅ Delay scroll by 1s (after Step 3 renders)
                setTimeout(() => {
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }, 500);
              }}
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 3: Show result summary
  return (
    <div style={styles.container}>
      <motion.div
        key="step3"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4 }}
      >
        
        {/* Back button at top left */}
        <div style={{ position: "relative", minHeight: "30px" }}>
          <button
            style={{
                position: "absolute",
                // top: "1px",
                left: "10px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                cursor: "pointer",
                background: "#f5f5f5",
              }}
            onClick={() => {
              setConfirmed(false); // go back to Step 2
            }}
          >
            ← Back
          </button>
        </div>

        <h2>🌞 System Summary</h2>
        <p>
          You selected: <b>{mode}</b>
        </p>

        {mode === "Hybrid" || mode === "Standby"? (
          <>
            {/* Diesel saving slider */}
            <label style={{ display: "block", margin: "20px 0" }}>
              Diesel Saving: <b>{dieselSaving}%</b>
              <input
                type="range"
                min="0"
                max="100"
                value={dieselSaving}
                onChange={(e) => setDieselSaving(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </label>

            {/* Calculation */}
            {(() => {
              const pf = 0.85;
              const peakSunHour = 3.42;
              const panelWatt = 640; // W per panel

              // Step 1: Convert kVA to kW capacity (for display/reference)
              const gensetCapacity = Number(kva) * pf;

              // Step 2: Use min, avg, max loads directly from Step 2 (already in kW)
              const minLoad = Number(rangeMin);
              const avgLoad = Number(average);
              const maxLoad = Number(rangeMax);

              // Step 3: Daily genset energy (kWh/day)
              const genset_kWh = avgLoad * Number(operatingHours);

              // Step 4: Required solar contribution (based on diesel saving %)
              const required_kWh = genset_kWh * (dieselSaving / 100);

              // Step 5: Solar panel & battery sizing
              const perPanel_kWh = (panelWatt / 1000) * peakSunHour;
              const totalPanels = Math.ceil((required_kWh * 1.3) / perPanel_kWh);

              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    gap: "20px",
                    marginTop: "20px",
                  }}
                >
                  {/* Card 1: System Constants */}
                  <div style={styles.card}>
                    <h4>🔧 System Constants</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Power Factor (PF) = <b>0.85</b></li>
                      <li>kVA → kW Conversion = <b>kW = kVA × PF</b></li>
                      <li>Peak Sun Hours = <b>{peakSunHour}</b> h/day</li>
                      <li>Solar Panel Size = <b>{panelWatt} W</b></li>
                    </ul>
                  </div>

                  {/* Card 2: Input Parameters */}
                  <div style={styles.card}>
                    <h4>📊 Input Parameters</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Genset Rating = <b>{kva} kVA</b> (≈ {gensetCapacity.toFixed(1)} kW)</li>
                      <li>Operating Hours = <b>{operatingHours} h/day</b></li>
                      <li>Diesel Saving Target = <b>{dieselSaving}%</b></li>
                    </ul>
                  </div>

                  {/* Card 3: Load (from Step 2) */}
                  <div style={styles.card}>
                    <h4>⚡ Load Information</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Min Load = <b>{minLoad} kW</b></li>
                      <li>Avg Load = <b>{avgLoad} kW</b></li>
                      <li>Max Load = <b>{maxLoad} kW</b></li>
                    </ul>
                  </div>

                  {/* Card 4: Energy Calculations */}
                  <div style={styles.card}>
                    <h4>🧮 Energy Calculations</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Daily Genset Energy = {avgLoad} × {operatingHours} = <b>{genset_kWh.toFixed(1)} kWh/day</b></li>
                      <li>Required Solar Energy = {genset_kWh.toFixed(1)} × {dieselSaving/100} = <b>{required_kWh.toFixed(1)} kWh/day</b></li>
                      <li>Solar Output per Panel = ({panelWatt/1000} × {peakSunHour}) = <b>{perPanel_kWh.toFixed(2)} kWh/day</b></li>
                    </ul>
                  </div>

                  {/* Card 5: System Requirement */}
                  <div style={styles.card}>
                    <h4>✅ System Requirement</h4>

                    {phase === "three" ? (
                      <ul style={{ textAlign: "left" }}>
                        <li>
                          Total Solar Panels ≈{" "}
                          <b>
                            ({required_kWh.toFixed(1)} * 1.3) ÷ {perPanel_kWh.toFixed(2)} ≈ {totalPanels}
                          </b>{" "}
                          (~{Math.ceil(totalPanels / 3)} per phase)
                        </li>
                        <li>
                          Required Battery Storage = <b>{required_kWh.toFixed(1)} kWh</b>
                        </li>
                      </ul>
                    ) : (
                      <ul style={{ textAlign: "left" }}>
                        <li>
                          Total Solar Panels ≈{" "}
                          <b>
                            ({required_kWh.toFixed(1)} * 1.3) ÷ {perPanel_kWh.toFixed(2)} ≈ {totalPanels}
                          </b>
                        </li>
                        <li>
                          Required Battery Storage = <b>{required_kWh.toFixed(1)} kWh</b>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <>
            {/* Off-Grid */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {/* Input Parameters */}
              <div style={styles.card}>
                <h4>📥 Input Parameters</h4>
                <p>Electricity Usage: <b>{value} kWh/day</b></p>
                <p>Generator Mode: <b>{hasGenset}</b></p>
              </div>

              {/* System Constants */}
              <div style={styles.card}>
                <h4>⚙️ System Constants</h4>
                <p>Peak Sun Hour = <b>3.42 h/day</b></p>
                <p>Solar Panel Wattage = <b>640 W</b></p>
                <p>Autonomy = <b>3 Days</b></p>
              </div>

              {/* Calculation */}
              <div style={styles.card}>
                <h4>🧮 Calculation</h4>
                <p>Required kWh = <b>{value}</b> kWh/day</p>

                <p>
                  Panels Needed ≈ <br />
                  <b>({value} × 1.3) ÷ ((640 ÷ 1000) × 3.42)</b> <br />
                  ≈ <b>{Math.ceil((Number(value) * 1.3) / ((640 / 1000) * 3.42))}</b> panels
                </p>

                <p>
                  Battery Storage Needed ≈{" "}
                  <b>
                    ({value} × 3) ≈{" "} 
                    {Math.ceil((Number(value) * 3))} kWh
                  </b>
                </p>
              </div>

              {/* System Requirement */}
              <div style={styles.card}>
                <h4>✅ System Requirement</h4>
                <p>
                  Total Solar Panels:{" "}
                  <b>{Math.ceil((Number(value) * 1.3) / ((640 / 1000) * 3.42))}</b>
                </p>
                <p>
                  Required Battery Storage:{" "}
                  <b>
                    {Number(value) * 3} kWh
                  </b>
                </p>
                <p style={{ marginTop: "10px", fontStyle: "italic", color: "#555" }}>
                  ⚠️ Batteries provide autonomy for <b>3 days</b>.
                </p>
              </div>
            </div>
          </>
        )}

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          gap: "15px", 
          marginTop: "30px", 
          width: "100%"
          }}
          >
          <button
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "14px 24px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              width: "250px",
            }}
            onClick={() => {
              const doc = new jsPDF();

              // constants
              const peakSunHour = 3.42;
              const panelWatt = 640;

              let totalPanels = 0;
              let required_kWh = 0;
              let genset_kWh = 0;

              if (mode === "Hybrid" || mode === "Standby") {
                genset_kWh = Number(average) * Number(operatingHours); // average load × hours
                required_kWh = genset_kWh * (dieselSaving / 100);

                totalPanels = Math.ceil((required_kWh * 1.3) / ((panelWatt / 1000) * peakSunHour));

              } else {
                required_kWh = Number(value);
                required_kWh = Number(value || 0); // off-grid daily usage
                totalPanels = Math.ceil((required_kWh * 1.3) / ((panelWatt / 1000) * peakSunHour));
              };

              const requiredBatteryStorageKwh =
                mode === "Hybrid" || mode === "Standby" ? required_kWh : required_kWh * 3;

              // Title
              doc.setFontSize(20);
              doc.setTextColor(40, 90, 140);
              doc.text("System Sizing Report", 14, 20);

              // Section: Input Parameters
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 30, 190, 10, "F");
              doc.setTextColor(0);
              doc.setFontSize(14);
              doc.text("Input Parameters", 14, 37);

              doc.setFontSize(12);
              if (mode === "Hybrid" || mode === "Standby") {
                const kvaToKw = (Number(kva) * 85).toFixed(1);
                doc.setFont("helvetica", "normal")
                doc.text(`Mode: Hybrid`, 14, 47);
                doc.text(`Genset Rating: ${kva} kVA (= ${kvaToKw} kW at PF 0.85)`, 14, 55);
                doc.text(`Min Load: ${rangeMin} kW`, 14, 63);
                doc.text(`Avg Load: ${average} kW`, 14, 71);
                doc.text(`Max Load: ${rangeMax} kW`, 14, 79);
                doc.text(`Operating Hours: ${operatingHours} h/day`, 14, 87);
                doc.text(`Diesel Saving Target: ${dieselSaving}%`, 14, 95);
              } else {
                doc.text(`Mode: Off-Grid`, 14, 47);
                doc.text(`Daily Usage: ${value} kWh/day`, 14, 55);
                doc.text(
                  `Generator Mode: ${
                    hasGenset === "hybrid"
                      ? "Hybrid Mode"
                      : hasGenset === "standby"
                      ? "Standby Mode"
                      : "Not Applicable"
                  }`,
                  14,
                  63
                );
              }

              // Section: System Constants
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 105, 190, 10, "F");
              doc.setFontSize(14);
              doc.text("System Constants", 14, 112);

              doc.setFontSize(12);
              doc.text(`Power Factor: 0.85`, 14, 122);
              doc.text(`Peak Sun Hours: ${peakSunHour} h/day`, 14, 130);
              doc.text(`Solar Panel Size: ${panelWatt} W`, 14, 138);

              // Section: Full Calculations
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 156, 190, 10, "F");
              doc.setFontSize(14);
              doc.text("Full Calculations", 14, 163);

              doc.setFontSize(11);
              if (mode === "Hybrid" || mode === "Standby") {
                doc.text(`1) Daily Genset Energy = Avg Load × Hours = ${average} × ${operatingHours} = ${genset_kWh.toFixed(1)} kWh/day`, 14, 173);
                doc.text(`2) Required Solar = ${genset_kWh.toFixed(1)} × (${dieselSaving}% ÷ 100) = ${required_kWh.toFixed(1)} kWh/day`, 14, 181);
                doc.text(`3) Per Panel Output = (${panelWatt} ÷ 1000) × ${peakSunHour} = ${(panelWatt/1000*peakSunHour).toFixed(2)} kWh/day`, 14, 189);
                doc.text(`4) Total Panels (with 30% storage) = ${required_kWh.toFixed(1)} × 1.3 ÷ ${((panelWatt / 1000) * peakSunHour).toFixed(2)} = ${totalPanels}`, 14, 197);
                doc.text(`5) Required Battery Storage = ${requiredBatteryStorageKwh.toFixed(1)} kWh/day`, 14, 205);
              } else {
                doc.text(`1) Required Energy = ${required_kWh} kWh/day`, 14, 173);
                doc.text(`2) Per Panel Output = (${panelWatt} ÷ 1000) × ${peakSunHour} = ${(panelWatt/1000*peakSunHour).toFixed(2)} kWh/day`, 14, 181);
                doc.text(`3) Total Panels (with 30% storage) = ${required_kWh} × 1.3 ÷ ${((panelWatt / 1000) *peakSunHour).toFixed(2)} = ${totalPanels}`, 14, 189);
                doc.text(`4) Required Battery Storage = ${requiredBatteryStorageKwh.toFixed(1)} kWh/day`, 14, 197);
              }

              // Section: Final System Requirement
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 215, 190, 10, "F");
              doc.setFontSize(14);
              doc.text("System Requirement", 14, 222);

              doc.setFontSize(12);
              doc.setTextColor(20, 100, 20);
              doc.text(`Solar Panels Needed: ${totalPanels}`, 14, 232);
              doc.text(`Battery Storage Required: ${requiredBatteryStorageKwh.toFixed(1)} kWh/day`, 14, 240);

              doc.save("system-sizing-report.pdf");
            }}
          >
            📄 Export to PDF
          </button>

          <button
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "14px 24px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              width: "250px",
            }}
            onClick={() => {
              setMode("");
              setPhase("");
              setValue("");
              setOperatingM("");
              setRangeMin("");
              setRangeMax("");
              setAverage("");
              setKva("");
              setPhase("");
              setConfirmed(false);
              setOperatingHours(8);
              setDieselSaving(50);
              setHasGenset(null);
              setGensetLiters("")
            }}
          >
            ← Start Over
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: { width: 340, margin: "50px auto", textAlign: "center" },
  modeButton: {
    margin: "10px",
    padding: "10px 25px",
    fontSize: 16,
    cursor: "pointer",
    borderRadius: 8,
    background: "#2196F3",
    color: "white",
    border: "none",
  },
  helpButton: {
    margin: "10px 0",
    padding: "8px 15px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 6,
    background: "#4CAF50",
    color: "white",
    border: "none",
  },
  backButton: {
    marginTop: 15,
    marginLeft: 10,
    padding: "10px 20px",
    fontSize: 16,
    background: "#777",
    color: "white",
    cursor: "pointer",
    border: "none",
    borderRadius: 5,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    textAlign: "left",
    background: "#fafafa",
  },
  input: {
    padding: "8px",
    fontSize: 16,
    width: "80%",
    marginBottom: "10px",
    borderRadius: 5,
    border: "1px solid #ccc",
    textAlign: "center",
  },
  guideline: {
    background: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px",
    marginBottom: "15px",
    fontSize: "14px",
    textAlign: "left",
  },
  centerCard: {
    marginTop: "15px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  }
};

export default App;