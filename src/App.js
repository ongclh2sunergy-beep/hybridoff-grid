import React, { useState } from "react";
import { FaSolarPanel, FaBatteryFull, FaTimesCircle } from "react-icons/fa";
import { GiPowerGenerator } from "react-icons/gi";
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

  // step 2: off-grid
  const [applianceList, setApplianceList] = useState([]);
  const [hasGenset, setHasGenset] = useState(null); // for backup genset
  const [units, setUnits] = useState("");
  const [errorMessage, setErrorMessage] = useState("");  

  // Appliance helper states
  const [showHelper, setShowHelper] = useState(false);
  const [appliance, setAppliance] = useState("");
  const [power, setPower] = useState("");
  const [hours, setHours] = useState("");

  // Custom Appliance
  const [customText, setCustomText] = useState(
    "1. Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n2. Refrigerator – Medium – 1 unit – 24 hours/day\n\nPlease calculate the kWh/day for these appliances"
  );
  const [copyMessage, setCopyMessage] = useState("");

  // step 3: hybrid
  const [dieselSaving, setDieselSaving] = useState(50); // % saving from genset

  // step 3: off-grid
  // const [totalPanels, setTotalPanels] = useState(0);
  // const [totalBatteries, setTotalBatteries] = useState(0);

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
              width: 220,
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
              backgroundColor: "#007BFF",
            }}
          >
            <strong>Hybrid</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <FaBatteryFull size={40} />
              <GiPowerGenerator size={40} />
            </div>
          </button>

          {/* Off-Grid Button */}
          <button
            onClick={() => setMode("Off-Grid")}
            style={{
              width: 220,
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
            <strong>Off-Grid</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <FaBatteryFull size={40} />
              <GiPowerGenerator size={40} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", color: "red" }}>
              <FaTimesCircle /> No TNB
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
                // top: "1px",
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
                setShowHelper(false);
                setAppliance("");
                setUnits("");
                setPower("");
                setHours("");
                setApplianceList([]);
                setHasGenset(null);
                setErrorMessage("")
                setCustomText(
                  "1. Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n2. Refrigerator – Medium – 1 unit – 24 hours/day\n\nPlease calculate the kWh/day for these appliances"
                );
              }}
            >
              ← Back
            </button>
          </div>


        <h2>{mode} System Setup</h2>

        {mode === "Hybrid" ? (
          <>
            <p>Please select your genset phase first:</p>

            {/* Phase Selection */}
            <div style={{ marginTop: "10px", textAlign: "center" }}>
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

            {/* Show genset details only if phase is selected */}
            {phase && (
              <>
                <p style={{ marginTop: "15px" }}>Please enter your genset details:</p>

                {/* Operating M */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Operating M:
                </label>
                <input
                  type="number"
                  value={operatingM}
                  onChange={(e) => setOperatingM(e.target.value)}
                  style={styles.input}
                  placeholder="Enter operating M"
                />

                {/* Range Min */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Range Min (M):
                </label>
                <input
                  type="number"
                  value={rangeMin}
                  onChange={(e) => setRangeMin(e.target.value)}
                  style={styles.input}
                  placeholder="Enter minimum M"
                />

                {/* Range Max */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Range Max (M):
                </label>
                <input
                  type="number"
                  value={rangeMax}
                  onChange={(e) => setRangeMax(e.target.value)}
                  style={styles.input}
                  placeholder="Enter maximum M"
                />

                {/* Average */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Average (M):
                </label>
                <input
                  type="number"
                  value={average}
                  onChange={(e) => setAverage(e.target.value)}
                  style={styles.input}
                  placeholder="Enter average M"
                />

                {/* kVA */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Genset Rating (kVA):
                </label>
                <input
                  type="number"
                  value={kva}
                  onChange={(e) => setKva(e.target.value)}
                  style={styles.input}
                  placeholder="Enter genset kVA"
                />
              </>
            )}
          </>
        ) : (
          <>
            <p>Please enter your electricity demand (in kWh):</p>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={styles.input}
              placeholder="Enter electricity (kWh)"
            />

            {/* Appliance calculator */}
            <button
              style={styles.helpButton}
              onClick={() => setShowHelper(!showHelper)}
            >
              {showHelper ? "Close Helper" : "Help me calculate"}
            </button>

            {showHelper && (
              <div style={styles.card}>
                <h4>Appliance Calculator</h4>

                {/* Guideline Card */}
                <div style={styles.guideline}>
                  <h4>Guideline (Typical Power Ratings)</h4>
                  <p>Use this as a reference if you’re not sure about your appliances:</p>

                  <h5>❄ Air Conditioner</h5>
                  <ul>
                    <li>1.0 HP ≈ 750 W</li>
                    <li>1.5 HP ≈ 1100 W</li>
                    <li>2.0 HP ≈ 1500 W</li>
                    <li>2.5 HP ≈ 1800 W</li>
                  </ul>
                  <h5>🧊 Refrigerator</h5>
                  <ul>
                    <li>Small (150–200 L): ~100 W</li>
                    <li>Medium (250–350 L): ~150 W</li>
                    <li>Large (400+ L): ~200–250 W</li>
                  </ul>
                </div>

                {/* Appliance Dropdown */}
                <select
                  style={styles.input}
                  value={appliance}
                  onChange={(e) => setAppliance(e.target.value)}
                >
                  <option value="">-- Select Appliance --</option>
                  {/* Air Conditioner */}
                  <option value="Air Conditioner 1.0HP">Air Conditioner 1.0 HP</option>
                  <option value="Air Conditioner 1.5HP">Air Conditioner 1.5 HP</option>
                  <option value="Air Conditioner 2.0HP">Air Conditioner 2.0 HP</option>
                  <option value="Air Conditioner 2.5HP">Air Conditioner 2.5 HP</option>

                  {/* Refrigerator */}
                  <option value="Refrigerator Small">Refrigerator Small</option>
                  <option value="Refrigerator Medium">Refrigerator Medium</option>
                  <option value="Refrigerator Large">Refrigerator Large</option>

                  {/* Others */}
                  <option value="Others">Others</option>
                </select>

                {/* Units */}
                <input
                  type="number"
                  placeholder="Units"
                  style={styles.input}
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                />

                {/* Power (only if "Others") */}
                {appliance === "Others" && (
                  <input
                    type="number"
                    placeholder="Power (W)"
                    style={styles.input}
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                  />
                )}

                {/* Hours per day */}
                <input
                  type="number"
                  placeholder="Hours per day"
                  style={styles.input}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />

                {/* Add Appliance Button */}
                <button
                  style={styles.modeButton}
                  onClick={() => {
                    if (appliance && units && hours) {
                      let wattValue = power;

                      // Assign default wattage automatically
                      if (appliance.includes("1.0HP")) wattValue = 750;
                      else if (appliance.includes("1.5HP")) wattValue = 1100;
                      else if (appliance.includes("2.0HP")) wattValue = 1500;
                      else if (appliance.includes("2.5HP")) wattValue = 1800;
                      else if (appliance.includes("Small")) wattValue = 100;
                      else if (appliance.includes("Medium")) wattValue = 150;
                      else if (appliance.includes("Large")) wattValue = 225; // avg 200–250
                      else if (appliance === "Others") wattValue = Number(power);

                      const kwh = (units * wattValue * hours) / 1000;
                      setApplianceList((prev) => [
                        ...prev,
                        { appliance, units, power: wattValue, hours, kwh },
                      ]);
                      setValue((prev) => (Number(prev) || 0) + kwh);

                      setAppliance("");
                      setUnits("");
                      setPower("");
                      setHours("");
                    }
                  }}
                >
                  Add Appliance
                </button>

                {/* Show added appliances */}
                {applianceList.length > 0 && (
                  <div style={{ marginTop: "10px", textAlign: "left" }}>
                    <h4>Added Appliances:</h4>
                    <ul>
                      {applianceList.map((item, idx) => (
                        <li key={idx}>
                          {item.units} × {item.appliance} ({item.power}W × {item.hours}h) ={" "}
                          {item.kwh.toFixed(2)} kWh
                        </li>
                      ))}
                    </ul>
                    <p><b>Total: {value || 0} kWh</b></p>
                    <button
                      style={styles.backButton}
                      onClick={() => {
                        setApplianceList([]);
                        setValue("");
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}

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

              {copyMessage && (
                <p style={{ color: "green", fontSize: "14px", marginTop: "8px" }}>
                  {copyMessage}
                </p>
              )}
            </div>

            {/* Ask about genset backup */}
            <div style={styles.card}>
              <h4>Backup Genset</h4>
              <p>Do you have a backup genset?</p>
              <label>
                <input
                  type="radio"
                  name="backup"
                  value="yes"
                  checked={hasGenset === "yes"}
                  onChange={() => setHasGenset("yes")}
                />
                Yes
              </label>
              <label style={{ marginLeft: "15px" }}>
                <input
                  type="radio"
                  name="backup"
                  value="no"
                  checked={hasGenset === "no"}
                  onChange={() => setHasGenset("no")}
                />
                No
              </label>
            </div>
          </>
        )}

          {/* Main content (Confirm + Error Message) */}
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            {/* Show error message */}
            {errorMessage && (
              <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
            )}

            <button
              style={styles.modeButton}
              onClick={() => {
                if (mode === "Hybrid") {
                  if (!phase) {
                    setErrorMessage("⚠️ Please select a genset phase.");
                    return;
                  }
                  if (!operatingM) {
                    setErrorMessage("⚠️ Please enter operating M.");
                    return;
                  }
                  if (!rangeMin) {
                    setErrorMessage("⚠️ Please enter the minimum M.");
                    return;
                  }
                  if (!rangeMax) {
                    setErrorMessage("⚠️ Please enter the maximum M.");
                    return;
                  }
                  if (!average) {
                    setErrorMessage("⚠️ Please enter the average M.");
                    return;
                  }
                  if (!kva) {
                    setErrorMessage("⚠️ Please enter the genset rating (kVA).");
                    return;
                  }
                  // ✅ Guardrails
                   if (Number(operatingM) <= 0) {
                    setErrorMessage("⚠️ Operating M cannot be negative.");
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
                    setErrorMessage("⚠️ Minimum M cannot be greater than Maximum M.");
                    return;
                  }
                  if (Number(average) < Number(rangeMin) || Number(average) > Number(rangeMax)) {
                    setErrorMessage("⚠️ Average M must be between Min and Max.");
                    return;
                  }
                } else {
                  if (!value) {
                    setErrorMessage("⚠️ Please enter your electricity usage (kWh).");
                    return;
                  }
                  if (hasGenset === null) {
                    setErrorMessage("⚠️ Please select whether you have a backup genset.");
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

        {mode === "Hybrid" ? (
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
              const pf = 0.9;
              const peakSunHour = 3.42;
              const panelWatt = 615; // W per panel
              const battery_kWh = 5; // Assume each battery ~5 kWh usable

              // Convert genset meter percentage to kW
              const kvaNum = Number(kva);
              const min_kW = (Number(rangeMin) / 100) * (kvaNum * pf);
              const max_kW = (Number(rangeMax) / 100) * (kvaNum * pf);
              const avg_kW = (Number(average) / 100) * (kvaNum * pf);

              // Required solar energy based on avg load
              const required_kWh = avg_kW * (dieselSaving / 100);

              // Solar output per panel
              const perPanel_kWh = (panelWatt / 1000) * peakSunHour;

              // System sizing
              const totalPanels = Math.ceil(required_kWh / perPanel_kWh);
              const totalBatteries = Math.ceil(required_kWh / battery_kWh);

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
                  {/* Card 1: Input Parameters */}
                  <div style={styles.card}>
                    <h4>📊 Input Parameters</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Genset Rating = <b>{kva} kVA</b></li>
                      <li>Power Factor = <b>{pf}</b></li>
                      <li>Min Load = <b>{min_kW.toFixed(2)} kW</b></li>
                      <li>Max Load = <b>{max_kW.toFixed(2)} kW</b></li>
                      <li>Average Load = <b>{avg_kW.toFixed(2)} kW</b></li>
                      <li>Diesel Saving Target = <b>{dieselSaving}%</b></li>
                    </ul>
                  </div>

                  {/* Card 2: System Constants */}
                  <div style={styles.card}>
                    <h4>🔧 System Constants</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Peak Sun Hours = <b>{peakSunHour}</b> h/day</li>
                      <li>Solar Panel Size = <b>{panelWatt} W</b></li>
                      <li>Battery Capacity = <b>{battery_kWh} kWh</b></li>
                    </ul>
                  </div>

                  {/* Card 3: Calculations */}
                  <div style={styles.card}>
                    <h4>🧮 Calculations</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>
                        Required Solar Energy = {avg_kW.toFixed(2)} × {dieselSaving/100} ={" "}
                        <b>{required_kWh.toFixed(2)} kWh/day</b>
                      </li>
                      <li>
                        Solar Output per Panel = ({panelWatt/1000} × {peakSunHour}) ={" "}
                        <b>{perPanel_kWh.toFixed(2)} kWh/day</b>
                      </li>
                    </ul>
                  </div>

                  {/* Card 4: System Requirement */}
                  <div style={styles.card}>
                    <h4>✅ System Requirement</h4>
                    {phase === "three" ? (
                      <ul style={{ textAlign: "left" }}>
                        <li>
                          Total Solar Panels ≈{" "}
                          <b>
                            {required_kWh.toFixed(2)} ÷ {perPanel_kWh.toFixed(2)} ≈ {totalPanels}
                          </b>{" "}
                          (~{Math.ceil(totalPanels / 3)} per phase)
                        </li>
                        <li>
                          Total Batteries ≈{" "}
                          <b>
                            {required_kWh.toFixed(2)} ÷ {battery_kWh} ≈ {totalBatteries}
                          </b>{" "}
                          (~{Math.ceil(totalBatteries / 3)} per phase)
                        </li>
                      </ul>
                    ) : (
                      <ul style={{ textAlign: "left" }}>
                        <li>
                          Total Solar Panels ≈{" "}
                          <b>
                            {required_kWh.toFixed(2)} ÷ {perPanel_kWh.toFixed(2)} ≈ {totalPanels}
                          </b>
                        </li>
                        <li>
                          Total Batteries ≈{" "}
                          <b>
                            {required_kWh.toFixed(2)} ÷ {battery_kWh} ≈ {totalBatteries}
                          </b>
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
                <p>Backup Genset: <b>{hasGenset === "yes" ? "Yes" : "No"}</b></p>
              </div>

              {/* System Constants */}
              <div style={styles.card}>
                <h4>⚙️ System Constants</h4>
                <p>Peak Sun Hour = <b>3.42 h/day</b></p>
                <p>Solar Panel Wattage = <b>615 W</b></p>
                <p>Battery Capacity = <b>5 kWh</b></p>
                <p>Autonomy = <b>{hasGenset === "yes" ? "1 Day" : "3 Days"}</b></p>
              </div>

              {/* Calculation */}
              <div style={styles.card}>
                <h4>🧮 Calculation</h4>
                <p>Required kWh = <b>{value}</b> kWh/day</p>

                <p>
                  Panels Needed ≈{" "}
                  <b>
                    {value} ÷ ((615 ÷ 1000) × 3.42) ≈{" "}
                    {Math.ceil(Number(value) / ((615 / 1000) * 3.42))}
                  </b>
                </p>

                <p>
                  Batteries Needed ≈{" "}
                  <b>
                    ({value} × {hasGenset === "yes" ? 1 : 3}) ÷ 5 ≈{" "}
                    {Math.ceil((Number(value) * (hasGenset === "yes" ? 1 : 3)) / 5)}
                  </b>
                </p>
              </div>

              {/* System Requirement */}
              <div style={styles.card}>
                <h4>✅ System Requirement</h4>
                <p>
                  Total Solar Panels:{" "}
                  <b>{Math.ceil(Number(value) / ((615 / 1000) * 3.42))}</b>
                </p>
                <p>
                  Total Batteries:{" "}
                  <b>
                    {Math.ceil((Number(value) * (hasGenset === "yes" ? 1 : 3)) / 5)}
                  </b>
                </p>
                <p style={{ marginTop: "10px", fontStyle: "italic", color: "#555" }}>
                  ⚠️ Batteries provide autonomy for{" "}
                  {hasGenset === "yes"
                    ? "1 day (with genset backup)"
                    : "3 days (no backup genset)"}.
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
              width: "250px", // makes both buttons same width
            }}
          onClick={() => {
            const doc = new jsPDF();

            // constants
            const peakSunHour = 3.42;
            const panelWatt = 615;
            const battery_kWh = 5;

            let totalPanels = 0;
            let totalBatteries = 0;
            let required_kWh = 0;
            let genset_kWh = 0;
            let load_kW = 0;

            if (mode === "Hybrid") {
              load_kW = Number(average) * 0.9; // with PF
              genset_kWh = load_kW * Number(operatingM);
              required_kWh = genset_kWh * (dieselSaving / 100);

              totalPanels = Math.ceil(required_kWh / ((panelWatt / 1000) * peakSunHour));
              totalBatteries = Math.ceil(required_kWh / battery_kWh);
            } else {
              required_kWh = Number(value);
              totalPanels = Math.ceil(Number(value) / ((panelWatt / 1000) * peakSunHour));
              totalBatteries = Math.ceil(Number(value) / battery_kWh);
            }

            // Title
            doc.setFontSize(20);
            doc.setTextColor(40, 90, 140);
            doc.text("System Sizing Report", 14, 20);

            // Section: Input
            doc.setFillColor(230, 240, 255);
            doc.rect(10, 30, 190, 10, "F");
            doc.setTextColor(0);
            doc.setFontSize(14);
            doc.text("Input Parameters", 14, 37);

            doc.setFontSize(12);
            if (mode === "Hybrid") {
              doc.text(`Mode: Hybrid`, 14, 47);
              doc.text(`Average Load (M): ${average}`, 14, 55);
              doc.text(`Operating M: ${operatingM}`, 14, 63);
              doc.text(`Diesel Saving Target: ${dieselSaving}%`, 14, 71);
              doc.text(`Power Factor: 0.9`, 14, 79);
            } else {
              doc.text(`Mode: Off-Grid`, 14, 47);
              doc.text(`Daily Usage: ${value} kWh/day`, 14, 55);
              doc.text(`Backup Genset: ${hasGenset === "yes" ? "Yes" : "No"}`, 14, 63);
            }

            // Section: Calculation
            doc.setFillColor(230, 240, 255);
            doc.rect(10, 90, 190, 10, "F");
            doc.setTextColor(0);
            doc.setFontSize(14);
            doc.text("Calculations (Full Steps)", 14, 97);

            doc.setFontSize(11);
            if (mode === "Hybrid") {
              doc.text(`1) Load with PF = ${average} × 0.9 = ${load_kW.toFixed(2)} kW`, 14, 107);
              doc.text(`2) Genset Energy = ${load_kW.toFixed(2)} × ${operatingM} = ${genset_kWh.toFixed(1)} kWh/day`, 14, 115);
              doc.text(`3) Required Solar = ${genset_kWh.toFixed(1)} × (${dieselSaving}% ÷ 100) = ${required_kWh.toFixed(1)} kWh/day`, 14, 123);
              doc.text(`4) Per Panel Output = (${panelWatt} ÷ 1000) × ${peakSunHour} = ${(panelWatt/1000*peakSunHour).toFixed(2)} kWh/day`, 14, 131);
              doc.text(`5) Total Panels = ${required_kWh.toFixed(1)} ÷ ${(panelWatt/1000*peakSunHour).toFixed(2)} = ${totalPanels}`, 14, 139);
              doc.text(`6) Total Batteries = ${required_kWh.toFixed(1)} ÷ ${battery_kWh} = ${totalBatteries}`, 14, 147);
            } else {
              doc.text(`1) Required Energy = ${required_kWh} kWh/day`, 14, 107);
              doc.text(`2) Per Panel Output = (${panelWatt} ÷ 1000) × ${peakSunHour} = ${(panelWatt/1000*peakSunHour).toFixed(2)} kWh/day`, 14, 115);
              doc.text(`3) Total Panels = ${required_kWh} ÷ ${(panelWatt/1000*peakSunHour).toFixed(2)} = ${totalPanels}`, 14, 123);
              doc.text(`4) Total Batteries = ${required_kWh} ÷ ${battery_kWh} = ${totalBatteries}`, 14, 131);
            }

            // Section: System Requirement
            doc.setFillColor(230, 240, 255);
            doc.rect(10, 160, 190, 10, "F");
            doc.setFontSize(14);
            doc.text("System Requirement", 14, 167);

            doc.setFontSize(12);
            doc.setTextColor(20, 100, 20);
            doc.text(`Solar Panels Needed: ${totalPanels}`, 14, 177);
            doc.text(`Batteries Needed: ${totalBatteries}`, 14, 185);

            // Footer
            doc.setTextColor(120);
            doc.setFontSize(10);
            doc.text("Generated by Solar Sizing Tool", 14, 280);

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
              setShowHelper(false);
              setAppliance("");
              setPower("");
              setHours("");
              setDieselSaving(50);
              setHasGenset(null);
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
};

export default App;