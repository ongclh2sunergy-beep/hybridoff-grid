import React, { useState } from "react";
import { FaSolarPanel, FaBatteryFull, FaBolt, FaTimesCircle } from "react-icons/fa";
import { GiPowerGenerator } from "react-icons/gi";

function App() {
  const [mode, setMode] = useState("");        // "Hybrid" or "Off-Grid"
  const [value, setValue] = useState("");      // Genset kWm or Electricity kWh
  const [confirmed, setConfirmed] = useState(false);

  // step 2: hybrid
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");
  const [average, setAverage] = useState("");
  const [phase, setPhase] = useState("");

  // step 2: off-grid
  const [applianceList, setApplianceList] = useState([]);
  const [hasGenset, setHasGenset] = useState(""); // for backup genset
  const [units, setUnits] = useState("");

  // Appliance helper states
  const [showHelper, setShowHelper] = useState(false);
  const [appliance, setAppliance] = useState("");
  const [power, setPower] = useState("");
  const [hours, setHours] = useState("");

  // Step 1: Select mode
  if (!mode) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Select your system type</h2>

        <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "20px" }}>
          
          {/* Hybrid Button */}
          <button
            onClick={() => setMode("Hybrid")}
            style={{
              width: 200,
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
            }}
          >
            <strong>Hybrid</strong>
            <div style={{ display: "flex", gap: "8px", fontSize: "22px" }}>
              <FaSolarPanel /> <FaBatteryFull /> <GiPowerGenerator />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", color: "green" }}>
              ✔ Solar + Battery + Genset
            </div>
          </button>

          {/* Off-Grid Button */}
          <button
            onClick={() => setMode("Off-Grid")}
            style={{
              width: 200,
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
            }}
          >
            <strong>Off-Grid</strong>
            <div style={{ display: "flex", gap: "8px", fontSize: "22px" }}>
              <FaSolarPanel /> <FaBatteryFull />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", color: "red" }}>
              <FaTimesCircle /> No TNB
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", color: "green" }}>
              ✔ Solar + Battery
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Ask user-specific input
  if (!confirmed) {
    return (
      <div style={styles.container}>
        <h2>{mode} System Setup</h2>

        {mode === "Hybrid" ? (
          <>
            <p>Please enter your genset details:</p>

            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={styles.input}
              placeholder="Operating M"
            />

            <input
              type="number"
              value={rangeMin}
              onChange={(e) => setRangeMin(e.target.value)}
              style={styles.input}
              placeholder="Range Min (kW)"
            />

            <input
              type="number"
              value={rangeMax}
              onChange={(e) => setRangeMax(e.target.value)}
              style={styles.input}
              placeholder="Range Max (kW)"
            />

            <input
              type="number"
              value={average}
              onChange={(e) => setAverage(e.target.value)}
              style={styles.input}
              placeholder="Average (kW)"
            />

            <div style={{ marginTop: "10px", textAlign: "left" }}>
              <p>Phase:</p>
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
          </>
        ) : (
          <>
            <p>Please enter your electricity usage (in kWh):</p>
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

            {/* Ask about genset backup */}
            <div style={styles.card}>
              <h4>Backup Genset</h4>
              <p>Do you have a backup genset in your system?</p>
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

        <div>
          <button
            style={styles.modeButton}
            onClick={() => setConfirmed(true)}
            disabled={
              mode === "Hybrid"
                ? !value || !rangeMin || !rangeMax || !average || !phase
                : !value
            }
          >
            Confirm
          </button>
          <button
            style={styles.backButton}
            onClick={() => {
              setMode("");
              setValue("");
              setRangeMin("");
              setRangeMax("");
              setAverage("");
              setPhase("");
              setShowHelper(false);
              setAppliance("");
              setPower("");
              setHours("");
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Show result summary
  return (
    <div style={styles.container}>
      <h2>System Summary</h2>
      <p>
        You selected: <b>{mode}</b>
      </p>
      <p>
        {mode === "Hybrid"
          ? `Genset size: ${value} kWm`
          : `Electricity usage: ${value} kWh`}
      </p>
      <button
        style={styles.backButton}
        onClick={() => {
          setMode("");
          setValue("");
          setRangeMin("");
          setRangeMax("");
          setAverage("");
          setPhase("");
          setConfirmed(false);
          setShowHelper(false);
          setAppliance("");
          setPower("");
          setHours("");
        }}
      >
        ← Start Over
      </button>
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