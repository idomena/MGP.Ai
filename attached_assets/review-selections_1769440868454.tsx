"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Edit2,
  ArrowLeft,
  ArrowRight,
  User,
  Weight,
  Target,
  Clock,
  Activity,
  Utensils,
  AlertCircle,
  FileText,
  ChevronDown,
  Check,
} from "lucide-react"
import type { UserData } from "@/lib/conversation-manager"
import WeightSelector from "./weight-selector"
import OptionSelector from "./option-selector"
import TimeframeSelector from "./timeframe-selector"
import NameInput from "./name-input"
import YesNoSelector from "./yes-no-selector"
import AdditionalInfo from "./additional-info"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
// Add the import for the confirmation dialog at the top of the file
import GoalWeightConfirmationDialog from "@/components/goal-weight-confirmation-dialog"

interface ReviewSelectionsProps {
  userData: UserData
  onComplete: (updatedData?: Partial<UserData>) => void
}

export default function ReviewSelections({ userData, onComplete }: ReviewSelectionsProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [updatedData, setUpdatedData] = useState<Partial<UserData>>({})
  const [showFoodSensitivitiesSelector, setShowFoodSensitivitiesSelector] = useState(false)
  const [hasFoodSensitivities, setHasFoodSensitivities] = useState<boolean | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const isMobile = useMobileDetection()
  // Add these new state variables inside the ReviewSelections component, after the existing state declarations
  const [showGoalWeightConfirmation, setShowGoalWeightConfirmation] = useState(false)
  const [pendingTargetWeight, setPendingTargetWeight] = useState<number | null>(null)

  // Get the merged data (original + updates)
  const mergedData = { ...userData, ...updatedData }

  // Initialize hasFoodSensitivities based on userData when editing section changes
  useEffect(() => {
    if (editingSection === "hasFoodSensitivities") {
      // Initialize based on current userData or already updated data
      setHasFoodSensitivities(
        userData.hasFoodSensitivities !== undefined
          ? userData.hasFoodSensitivities
          : !userData.foodSensitivities?.includes("none"),
      )
    }
  }, [editingSection, userData])

  // Format activity level for display
  const formatActivityLevel = (level = "") => {
    switch (level) {
      case "very-active":
        return "פעיל מאוד"
      case "moderate":
        return "פעיל בינוני"
      case "active":
        return "פעיל"
      case "sedentary":
        return "לא פעיל"
      default:
        return level
    }
  }

  // Format goal for display
  const formatGoal = (goal = "") => {
    switch (goal) {
      case "lose":
        return "הפחתת משקל"
      case "maintain":
        return "שמירה על משקל"
      case "gain":
        return "העלאת משקל"
      default:
        return goal
    }
  }

  // Add this validation function after the formatGoal function
  // Check for inconsistency between goal and target weight
  const checkGoalWeightConsistency = (goal: string, currentWeight: number, targetWeight: number) => {
    if (goal === "lose" && targetWeight >= currentWeight) {
      return false
    }
    if (goal === "gain" && targetWeight <= currentWeight) {
      return false
    }
    return true
  }

  // Handle the food sensitivity yes/no response
  const handleFoodSensitivityResponse = (response: "yes" | "no") => {
    const hasAllergies = response === "yes"
    setHasFoodSensitivities(hasAllergies)

    // Update the userData with the yes/no response
    const newUpdates = { ...updatedData, hasFoodSensitivities: hasAllergies }

    // If "no", set foodSensitivities to ["none"] and return to review
    if (!hasAllergies) {
      newUpdates.foodSensitivities = ["none"]
      setUpdatedData(newUpdates)
      setEditingSection(null) // Return to review screen
      showUpdateSuccess("Food sensitivities updated")
    } else {
      // If "yes", show the food sensitivities selector
      setUpdatedData(newUpdates)
      setShowFoodSensitivitiesSelector(true)
    }
  }

  // Handle the specific food sensitivities selection
  const handleFoodSensitivitiesSelection = (selectedSensitivities: string[]) => {
    const newUpdates = {
      ...updatedData,
      hasFoodSensitivities: true,
      foodSensitivities: selectedSensitivities,
    }
    setUpdatedData(newUpdates)
    setShowFoodSensitivitiesSelector(false)
    setEditingSection(null) // Return to review screen
    showUpdateSuccess("Food sensitivities updated")
  }

  // Show success message
  const showUpdateSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessMessage(true)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 2000)
  }

  // Update the handleUpdate function to properly handle navigation back to the review screen
  const handleUpdate = (section: string, value: any) => {
    const newUpdates = { ...updatedData }

    switch (section) {
      case "assistantName":
        newUpdates.assistantName = value
        showUpdateSuccess("Assistant name updated")
        break
      case "weight":
        newUpdates.weight = value.weight
        newUpdates.weightUnit = value.unit
        showUpdateSuccess("Weight updated")
        break
      // Modify the handleUpdate function to add validation for target weight
      // Find the case for "targetWeight" in the handleUpdate function and replace it with:
      case "goal":
        newUpdates.goal = value[0]

        // Check if there's an existing target weight that would be inconsistent with the new goal
        const targetWeight = mergedData.targetWeight || mergedData.weight
        const currentWeight = mergedData.weight || 0

        const isConsistent = checkGoalWeightConsistency(value[0], currentWeight, targetWeight)

        if (!isConsistent && value[0] !== "maintain") {
          // If inconsistent, suggest a new target weight based on the goal
          let suggestedTarget = currentWeight
          if (value[0] === "lose") {
            suggestedTarget = Math.max(currentWeight - 5, 40) // Subtract 5 units, minimum 40
          } else if (value[0] === "gain") {
            suggestedTarget = currentWeight + 5 // Add 5 units
          }

          // Update both goal and target weight
          newUpdates.targetWeight = suggestedTarget
          showUpdateSuccess(
            `Goal updated to ${formatGoal(value[0])} with suggested target weight of ${suggestedTarget}${mergedData.weightUnit}`,
          )
        } else {
          showUpdateSuccess("Fitness goal updated")
        }
        break
      case "targetWeight":
        // Check if the target weight is consistent with the goal
        const targetConsistency = checkGoalWeightConsistency(
          mergedData.goal || "maintain",
          mergedData.weight || 0,
          value.weight,
        )

        if (!targetConsistency && mergedData.goal !== "maintain") {
          // Store the pending target weight and show confirmation dialog
          setPendingTargetWeight(value.weight)
          setShowGoalWeightConfirmation(true)
          setEditingSection(null)
          return // Important: return early to prevent updating state
        } else {
          // If consistent or goal is maintain, update normally
          newUpdates.targetWeight = value.weight
          showUpdateSuccess("Target weight updated")
        }
        break
      case "timeframe":
        newUpdates.timeframe = value.value
        showUpdateSuccess("Timeframe updated")
        break
      case "gender":
        newUpdates.gender = value[0]
        showUpdateSuccess("Gender updated")
        break
      case "activityLevel":
        newUpdates.activityLevel = value[0]
        showUpdateSuccess("Activity level updated")
        break
      case "dietaryPreferences":
        newUpdates.dietaryPreferences = value
        showUpdateSuccess("Dietary preferences updated")
        break
      case "additionalInfo":
        newUpdates.additionalInfo = value
        showUpdateSuccess("Additional info updated")
        break
    }

    setUpdatedData(newUpdates)
    setEditingSection(null) // Return to the review screen
  }

  // Complete the review process
  const handleComplete = () => {
    onComplete(Object.keys(updatedData).length > 0 ? updatedData : undefined)
  }

  // Add these handler functions for the confirmation dialog after the handleComplete function
  // Handle updating the goal instead of the target weight
  const handleUpdateGoal = () => {
    if (pendingTargetWeight === null) return

    const currentWeight = mergedData.weight || 0
    const newGoal = pendingTargetWeight > currentWeight ? "gain" : "lose"

    const newUpdates = {
      ...updatedData,
      goal: newGoal,
      targetWeight: pendingTargetWeight,
    }

    setUpdatedData(newUpdates)
    setPendingTargetWeight(null)
    setShowGoalWeightConfirmation(false)
    showUpdateSuccess(
      `Goal updated to ${formatGoal(newGoal)} with target weight of ${pendingTargetWeight}${mergedData.weightUnit}`,
    )
  }

  // Handle updating the target weight to be consistent with the goal
  const handleUpdateTargetWeight = () => {
    if (pendingTargetWeight === null) return

    const currentWeight = mergedData.weight || 0
    const goal = mergedData.goal || "maintain"

    // Calculate a suggested target weight based on the goal
    let suggestedTarget = currentWeight
    if (goal === "lose") {
      suggestedTarget = Math.max(currentWeight - 5, 40) // Subtract 5 units, minimum 40
    } else if (goal === "gain") {
      suggestedTarget = currentWeight + 5 // Add 5 units
    }

    // Set the editing section to target weight to let the user choose a new value
    setEditingSection("targetWeight")
    setPendingTargetWeight(null)
    setShowGoalWeightConfirmation(false)
  }

  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // Add a cancel button to the editing components to allow users to go back without saving changes
  const renderEditComponent = () => {
    if (!editingSection) return null

    // Add a wrapper with a back button for all edit components
    const EditWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="space-y-4">
        <div className="bg-[#2a2a2a] p-4 rounded-xl border border-[#3a3a3a] mb-4">
          <button
            onClick={() => {
              setEditingSection(null)
              setShowFoodSensitivitiesSelector(false)
              setHasFoodSensitivities(null)
            }}
            className="flex items-center text-[#aaf163] mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to review</span>
          </button>
          <h3 className="text-white text-lg font-medium">
            Edit {editingSection === "hasFoodSensitivities" ? "Food Sensitivities" : editingSection}
          </h3>
        </div>
        {children}
        <button
          onClick={() => {
            setEditingSection(null)
            setShowFoodSensitivitiesSelector(false)
            setHasFoodSensitivities(null)
          }}
          className="w-full py-3 px-4 rounded-xl bg-[#2a2a2a] border border-[#3a3a3a] text-white hover:bg-[#333333] transition-all"
        >
          Cancel
        </button>
      </div>
    )

    // Special handling for food sensitivities
    if (editingSection === "hasFoodSensitivities") {
      // If we're showing the detailed food sensitivities selector
      if (showFoodSensitivitiesSelector) {
        return (
          <EditWrapper>
            <div className="bg-[#333333] p-3 rounded-lg mb-4">
              <p className="text-white text-sm">
                You indicated that you have food sensitivities. Please select all that apply:
              </p>
            </div>
            <OptionSelector
              multiSelect={true}
              options={[
                { id: "gluten", label: "Gluten" },
                { id: "dairy", label: "Dairy" },
                { id: "nuts", label: "Nuts" },
                { id: "peanuts", label: "Peanuts" },
                { id: "shellfish", label: "Shellfish" },
                { id: "eggs", label: "Eggs" },
                { id: "soy", label: "Soy" },
                { id: "fish", label: "Fish" },
                { id: "other", label: "Other" },
              ]}
              onSelect={handleFoodSensitivitiesSelection}
            />
            <button
              onClick={() => {
                setShowFoodSensitivitiesSelector(false)
                setHasFoodSensitivities(false)
                handleFoodSensitivityResponse("no")
              }}
              className="w-full mt-2 py-2 px-4 rounded-xl bg-[#333333] text-white hover:bg-[#3a3a3a] transition-all text-sm"
            >
              I don't have food sensitivities after all
            </button>
          </EditWrapper>
        )
      }

      // Otherwise show the yes/no selector
      return (
        <EditWrapper>
          <div className="bg-[#333333] p-3 rounded-lg mb-4">
            <p className="text-white text-sm">Do you have any food sensitivities or allergies?</p>
          </div>
          <YesNoSelector yesLabel="Yes" noLabel="No" onSelect={handleFoodSensitivityResponse} />
        </EditWrapper>
      )
    }

    switch (editingSection) {
      case "assistantName":
        return (
          <EditWrapper>
            <NameInput
              placeholder="Enter a name for your assistant"
              suggestions={["Coach", "Trainer", "Buddy", "Fit", "Max", "Alex", "Sam"]}
              required={true}
              onSelect={(value) => handleUpdate("assistantName", value)}
            />
          </EditWrapper>
        )
      case "weight":
        return (
          <EditWrapper>
            <WeightSelector
              initialValue={userData.weight}
              unit={userData.weightUnit}
              onSelect={(weight, unit) => handleUpdate("weight", { weight, unit })}
            />
          </EditWrapper>
        )
      case "goal":
        return (
          <EditWrapper>
            <OptionSelector
              options={[
                {
                  id: "lose",
                  label: "Lose Weight",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M3 17L9 11L13 15L21 7" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 7H21V11" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
                      }}
                    />
                  ),
                  description: "Reduce body fat and get leaner",
                },
                {
                  id: "maintain",
                  label: "Maintain Weight",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M3 12H21" stroke="#aaf163" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
                      }}
                    />
                  ),
                  description: "Stay at your current weight",
                },
                {
                  id: "gain",
                  label: "Gain Weight",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M3 7L9 13L13 9L21 17" stroke="#7c57ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 17H21V13" stroke="#7c57ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
                      }}
                    />
                  ),
                  description: "Build muscle and increase mass",
                },
              ]}
              onSelect={(value) => handleUpdate("goal", value)}
            />
          </EditWrapper>
        )
      case "targetWeight":
        return (
          <EditWrapper>
            <WeightSelector
              initialValue={mergedData.targetWeight || mergedData.weight}
              unit={mergedData.weightUnit}
              isTargetWeight={true}
              currentWeight={mergedData.weight}
              goalType={mergedData.goal as "lose" | "maintain" | "gain"}
              onSelect={(weight, unit) => handleUpdate("targetWeight", { weight, unit: mergedData.weightUnit })}
              onValidationFail={(weight, unit) => {
                setPendingTargetWeight(weight)
                setShowGoalWeightConfirmation(true)
                setEditingSection(null)
              }}
            />
          </EditWrapper>
        )
      case "timeframe":
        return (
          <EditWrapper>
            <TimeframeSelector
              options={[
                { id: "1month", label: "1 month", value: "1 month" },
                { id: "3months", label: "3 months", value: "3 months" },
                { id: "6months", label: "6 months", value: "6 months" },
                { id: "1year", label: "1 year", value: "1 year" },
              ]}
              onSelect={(id, value) => handleUpdate("timeframe", { id, value })}
            />
          </EditWrapper>
        )
      case "gender":
        return (
          <EditWrapper>
            <OptionSelector
              options={[
                {
                  id: "male",
                  label: "Male",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="10" cy="14" r="5" stroke="#7c57ff" strokeWidth="2"/><path d="M14 10L20 4" stroke="#7c57ff" strokeWidth="2"/><path d="M15 4H20V9" stroke="#7c57ff" strokeWidth="2"/></svg>`,
                      }}
                    />
                  ),
                },
                {
                  id: "female",
                  label: "Female",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="8" r="5" stroke="#00D2FF" strokeWidth="2"/><path d="M12 13V21" stroke="#00D2FF" strokeWidth="2"/><path d="M9 18H15" stroke="#00D2FF" strokeWidth="2"/></svg>`,
                      }}
                    />
                  ),
                },
                {
                  id: "other",
                  label: "Other",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="5" stroke="#aaf163" strokeWidth="2"/><path d="M12 7V17" stroke="#aaf163" strokeWidth="2"/><path d="M7 12H17" stroke="#aaf163" strokeWidth="2"/></svg>`,
                      }}
                    />
                  ),
                },
              ]}
              onSelect={(value) => handleUpdate("gender", value)}
            />
          </EditWrapper>
        )
      case "activityLevel":
        return (
          <EditWrapper>
            <OptionSelector
              options={[
                {
                  id: "sedentary",
                  label: "Sedentary",
                  description: "Little to no exercise",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#a3a3a8" strokeWidth="2"/><path d="M12 6V8" stroke="#a3a3a8" strokeWidth="2" strokeLinecap="round"/><path d="M12 16V18" stroke="#a3a3a8" strokeWidth="2" strokeLinecap="round"/><path d="M16.24 7.76L14.83 9.17" stroke="#a3a3a8" strokeWidth="2" strokeLinecap="round"/><path d="M9.17 14.83L7.76 16.24" stroke="#a3a3a8" strokeWidth="2" strokeLinecap="round"/><path d="M18 12H16" stroke="#a3a3a8" strokeWidth="2" strokeLinecap="round"/><path d="M8 12H6" stroke="#a3a3a8" strokeWidth="2" strokeLinecap="round"/><path d="M16.24 16.24L14.83 14.83" stroke="#a3a3a8" strokeWidth="2" strokeLinecap="round"/><path d="M9.17 9.17L7.76 7.76" stroke="#a3a3a8" strokeWidth="2" strokeLinecap="round"/></svg>`,
                      }}
                    />
                  ),
                },
                {
                  id: "moderate",
                  label: "Moderately Active",
                  description: "Exercise 1-3 times/week",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M14 3V7M14 11V7M14 7H18M6 21V17M6 13V17M6 17H10" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 7L18 17" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
                      }}
                    />
                  ),
                },
                {
                  id: "active",
                  label: "Active",
                  description: "Exercise 3-5 times/week",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M16 5V9M16 13V9M16 9H20M8 19V15M8 11V15M8 15H12" stroke="#7c57ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 5L20 19" stroke="#7c57ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
                      }}
                    />
                  ),
                },
                {
                  id: "very-active",
                  label: "Very Active",
                  description: "Exercise 6+ times/week",
                  icon: (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M18 5L6 19" stroke="#aaf163" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 5L18 19" stroke="#aaf163" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3V6" stroke="#aaf163" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 18V21" stroke="#aaf163" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12H2" stroke="#aaf163" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 12H19" stroke="#aaf163" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
                      }}
                    />
                  ),
                },
              ]}
              onSelect={(value) => handleUpdate("activityLevel", value)}
            />
          </EditWrapper>
        )
      case "dietaryPreferences":
        return (
          <EditWrapper>
            <OptionSelector
              multiSelect={true}
              options={[
                { id: "vegetarian", label: "Vegetarian" },
                { id: "vegan", label: "Vegan" },
                { id: "gluten-free", label: "Gluten-Free" },
                { id: "dairy-free", label: "Dairy-Free" },
                { id: "keto", label: "Keto" },
                { id: "paleo", label: "Paleo" },
                { id: "none", label: "No Preferences" },
              ]}
              onSelect={(value) => handleUpdate("dietaryPreferences", value)}
            />
          </EditWrapper>
        )
      case "additionalInfo":
        return (
          <EditWrapper>
            <AdditionalInfo
              placeholder="Share any additional information here..."
              skipLabel="Remove additional info"
              submitLabel="Update information"
              onSubmit={(value) => handleUpdate("additionalInfo", value)}
            />
          </EditWrapper>
        )
      default:
        return null
    }
  }

  // Define the card colors for different sections
  const cardColors = {
    personal: { bg: "#00D2FF20", icon: "text-[#7c57ff]", accent: "#7c57ff" },
    fitness: { bg: "#aaf16320", icon: "text-[#00D2FF]", accent: "#00D2FF" },
    diet: { bg: "#7c57ff20", icon: "text-[#aaf163]", accent: "#aaf163" },
  }

  // Compact info item for the summary view
  const CompactInfoItem = ({
    label,
    value,
    icon,
    onEdit,
    color = "#00D2FF",
  }: {
    label: string
    value: string
    icon: React.ReactNode
    onEdit: () => void
    color?: string
  }) => (
    <motion.div
      className="flex items-center justify-between py-2"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 3 }}
    >
      <div className="flex items-center">
        <div className={`p-1.5 rounded-full mr-2`} style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <div>
          <p className="text-[#a3a3a8] text-xs">{label}</p>
          <p className="text-white text-sm font-medium">{value}</p>
        </div>
      </div>
      <motion.button
        onClick={onEdit}
        className="p-1 rounded-full hover:bg-[#3a3a3a] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Edit2 className="w-3.5 h-3.5 text-[#aaf163]" />
      </motion.button>
    </motion.div>
  )

  // Collapsible section component
  const CollapsibleSection = ({
    title,
    icon,
    isExpanded,
    onToggle,
    children,
    color = "#7c57ff",
    summary,
  }: {
    title: string
    icon: React.ReactNode
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
    color?: string
    summary: string
  }) => (
    <motion.div
      className="mb-3 overflow-hidden rounded-xl border border-[#3a3a3a]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ backgroundColor: `${color}10` }}
    >
      <motion.div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={onToggle}
        whileHover={{ backgroundColor: `rgba(58, 58, 58, 0.3)` }}
      >
        <div className="flex items-center">
          <div className={`p-1.5 rounded-full mr-2`} style={{ backgroundColor: `${color}20` }}>
            {icon}
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">{title}</h3>
            {!isExpanded && <p className="text-[#a3a3a8] text-xs truncate max-w-[180px]">{summary}</p>}
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-4 h-4 text-[#aaf163]" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-3 pb-3 border-t border-[#3a3a3a] pt-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full max-w-md mx-auto"
    >
      <AnimatePresence mode="wait">
        {editingSection ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {renderEditComponent()}
          </motion.div>
        ) : (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            {/* Compact Header */}
            <motion.div
              className="bg-[#2a2a2a] rounded-xl p-3 border border-[#3a3a3a] mb-3"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-white text-base font-bold" dir="rtl">
                  סיכום פרופיל
                </h2>
                <div className="bg-[#aaf163] text-[#1e1e1e] text-xs font-bold px-2 py-0.5 rounded-full">מוכן</div>
              </div>
              <p className="text-[#a3a3a8] text-xs" dir="rtl">
                הקש על כל חלק להרחבת פרטים
              </p>
            </motion.div>

            {/* Key Stats - Always visible */}
            <motion.div
              className="bg-gradient-to-r from-[#00D2FF20] to-[#7c57ff20] rounded-xl p-3 border border-[#3a3a3a] mb-3"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white text-sm font-medium" dir="rtl">
                  נתונים עיקריים
                </h3>
                <div className="text-[#aaf163] text-xs" dir="rtl">
                  במבט מהיר
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex items-center">
                  <Weight className="w-4 h-4 text-[#00D2FF] ml-1.5 rtl:mr-0" />
                  <div>
                    <p className="text-[#a3a3a8] text-xs" dir="rtl">
                      משקל
                    </p>
                    <p className="text-white text-sm font-medium" dir="rtl">
                      {mergedData.weight} {mergedData.weightUnit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Target className="w-4 h-4 text-[#7c57ff] ml-1.5 rtl:mr-0" />
                  <div>
                    <p className="text-[#a3a3a8] text-xs" dir="rtl">
                      מטרה
                    </p>
                    <p className="text-white text-sm font-medium" dir="rtl">
                      {formatGoal(mergedData.goal || "maintain")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Activity className="w-4 h-4 text-[#aaf163] ml-1.5 rtl:mr-0" />
                  <div>
                    <p className="text-[#a3a3a8] text-xs" dir="rtl">
                      פעילות
                    </p>
                    <p className="text-white text-sm font-medium" dir="rtl">
                      {formatActivityLevel(mergedData.activityLevel || "moderate").split(" ")[0]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="w-4 h-4 text-[#00D2FF] ml-1.5 rtl:mr-0" />
                  <div>
                    <p className="text-[#a3a3a8] text-xs" dir="rtl">
                      מגדר
                    </p>
                    <p className="text-white text-sm font-medium capitalize" dir="rtl">
                      {mergedData.gender || "לא צוין"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Collapsible Sections */}
            <CollapsibleSection
              title="Personal Information"
              icon={<User className="w-4 h-4" />}
              isExpanded={expandedSection === "personal"}
              onToggle={() => toggleSection("personal")}
              color={cardColors.personal.accent}
              summary={`${mergedData.assistantName || "Coach"}, ${mergedData.gender || "Not specified"}`}
            >
              <CompactInfoItem
                label="Assistant Name"
                value={mergedData.assistantName || "Coach"}
                icon={<User className="w-3.5 h-3.5 text-[#7c57ff]" />}
                onEdit={() => setEditingSection("assistantName")}
                color="#7c57ff"
              />
              <CompactInfoItem
                label="Gender"
                value={
                  mergedData.gender
                    ? mergedData.gender.charAt(0).toUpperCase() + mergedData.gender.slice(1)
                    : "Not specified"
                }
                icon={<User className="w-3.5 h-3.5 text-[#00D2FF]" />}
                onEdit={() => setEditingSection("gender")}
                color="#00D2FF"
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Fitness Goals"
              icon={<Target className="w-4 h-4" />}
              isExpanded={expandedSection === "fitness"}
              onToggle={() => toggleSection("fitness")}
              color={cardColors.fitness.accent}
              summary={`${formatGoal(mergedData.goal || "maintain")}, ${mergedData.weight} ${mergedData.weightUnit}`}
            >
              <CompactInfoItem
                label="Current Weight"
                value={`${mergedData.weight} ${mergedData.weightUnit}`}
                icon={<Weight className="w-3.5 h-3.5 text-[#00D2FF]" />}
                onEdit={() => setEditingSection("weight")}
                color="#00D2FF"
              />
              <CompactInfoItem
                label="Goal"
                value={formatGoal(mergedData.goal || "maintain")}
                icon={<Target className="w-3.5 h-3.5 text-[#7c57ff]" />}
                onEdit={() => setEditingSection("goal")}
                color="#7c57ff"
              />
              {mergedData.goal !== "maintain" && (
                <>
                  <CompactInfoItem
                    label="Target Weight"
                    value={`${mergedData.targetWeight || mergedData.weight} ${mergedData.weightUnit}`}
                    icon={<Weight className="w-3.5 h-3.5 text-[#7c57ff]" />}
                    onEdit={() => setEditingSection("targetWeight")}
                    color="#7c57ff"
                  />
                  {mergedData.timeframe && (
                    <CompactInfoItem
                      label="Timeframe"
                      value={mergedData.timeframe}
                      icon={<Clock className="w-3.5 h-3.5 text-[#aaf163]" />}
                      onEdit={() => setEditingSection("timeframe")}
                      color="#aaf163"
                    />
                  )}
                </>
              )}
              <CompactInfoItem
                label="Activity Level"
                value={formatActivityLevel(mergedData.activityLevel || "moderate")}
                icon={<Activity className="w-3.5 h-3.5 text-[#aaf163]" />}
                onEdit={() => setEditingSection("activityLevel")}
                color="#aaf163"
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Diet & Nutrition"
              icon={<Utensils className="w-4 h-4" />}
              isExpanded={expandedSection === "diet"}
              onToggle={() => toggleSection("diet")}
              color={cardColors.diet.accent}
              summary={
                mergedData.dietaryPreferences?.includes("none")
                  ? "No specific preferences"
                  : mergedData.dietaryPreferences?.join(", ") || "Not specified"
              }
            >
              <CompactInfoItem
                label="Dietary Preferences"
                value={
                  mergedData.dietaryPreferences?.includes("none")
                    ? "No specific preferences"
                    : mergedData.dietaryPreferences?.join(", ") || "Not specified"
                }
                icon={<Utensils className="w-3.5 h-3.5 text-[#00D2FF]" />}
                onEdit={() => setEditingSection("dietaryPreferences")}
                color="#00D2FF"
              />
              <CompactInfoItem
                label="Food Sensitivities"
                value={
                  mergedData.hasFoodSensitivities === false || mergedData.foodSensitivities?.includes("none")
                    ? "No allergies or sensitivities"
                    : mergedData.foodSensitivities?.join(", ") || "Not specified"
                }
                icon={<AlertCircle className="w-3.5 h-3.5 text-[#7c57ff]" />}
                onEdit={() => setEditingSection("hasFoodSensitivities")}
                color="#7c57ff"
              />
              {mergedData.additionalInfo && (
                <CompactInfoItem
                  label="Additional Information"
                  value={mergedData.additionalInfo || "None provided"}
                  icon={<FileText className="w-3.5 h-3.5 text-[#aaf163]" />}
                  onEdit={() => setEditingSection("additionalInfo")}
                  color="#aaf163"
                />
              )}
            </CollapsibleSection>

            {/* Continue Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#7c57ff] text-white font-medium hover:opacity-90 transition-all flex justify-center items-center gap-2 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span>Confirm and Continue</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-0 right-0 mx-auto w-64 bg-[#aaf163] text-[#1e1e1e] py-2 px-4 rounded-full text-center font-medium flex items-center justify-center gap-2 z-50 shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal-Weight Consistency Confirmation Dialog */}
      <GoalWeightConfirmationDialog
        isOpen={showGoalWeightConfirmation}
        onClose={() => setShowGoalWeightConfirmation(false)}
        currentWeight={mergedData.weight || 0}
        targetWeight={pendingTargetWeight || 0}
        weightUnit={mergedData.weightUnit || "kg"}
        goal={mergedData.goal || "maintain"}
        onUpdateGoal={handleUpdateGoal}
        onUpdateTargetWeight={handleUpdateTargetWeight}
      />
    </motion.div>
  )
}
