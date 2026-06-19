<template>
  <div class="container">
    <Navbar />

    <div class="card">
      <div class="card flex-row">
        <!-- Profile sidebar -->
        <div class="profile-sidebar">
          <div class="profile">
            <div class="profile-header">
              <div class="profile-img-container">
                <img v-if="profileImage" :src="profileImage" alt="Profile" class="profile-image" />
                <UserIcon v-else class="w-20 h-20 text-white" />
                <label class="change-pic" title="Change Profile Picture">
                  <PencilIcon class="w-5 h-5" />
                  <input type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
                </label>
              </div>
              <h2 class="profile-name">{{ fullName }}</h2>
              <p class="profile-role">Patient</p>
              
              <!-- Profile Completion Section -->
              <div class="completion-card">
                <div class="completion-header">
                  <span class="completion-title">Profile Completion</span>
                  <span class="completion-percentage">{{ calculateProfileCompletion }}%</span>
                </div>
                <div class="completion-bar-container">
                  <div class="completion-bar" :style="{ width: `${calculateProfileCompletion}%` }">
                    <div class="completion-glow"></div>
                  </div>
                </div>
                <p class="completion-message" :class="{ 'is-complete': calculateProfileCompletion === 100 }">
                  {{ calculateProfileCompletion === 100 ? 'Profile complete! 🎉' : completionMessage }}
                </p>
              </div>
            </div>
            <div class="divider-line"></div>
            <div class="profile-info">
              <p class="profile-detail">
                <User class="w-5 h-5 mr-2" />
                <span>{{ form.username || "Your Username" }}</span>
              </p>
              <p class="profile-detail">
                <MailIcon class="w-5 h-5 mr-2" />
                <span>{{ userEmail }}</span>
              </p>
              <p class="profile-detail">
                <CalendarIcon class="w-5 h-5 mr-2" />
                <span>Member since {{ memberSince }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Main content area with tabs -->
        <div class="profile-main-content">
          <div class="header-section">
            <h1 class="main-title">Profile Information</h1>
            <button class="edit-profile-btn" @click="toggleEditMode">
              <PencilIcon class="w-4 h-4 mr-2" />
              {{ isEditMode ? 'View Profile' : 'Edit Profile' }}
            </button>
          </div>

          <!-- Tabs Navigation -->
          <div class="tabs-navigation">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="switchTab(tab.id)"
              :class="['tab-button', { active: currentTab === tab.id }]"
            >
              {{ tab.name }}
            </button>
          </div>
          
          <!-- Tab Content -->
          <form @submit.prevent="submitForm" class="tab-content-form">
            <!-- Personal Information Tab -->
            <div v-show="currentTab === 'personal'" class="tab-content">
              <div class="info-section">
                <div class="form-grid">
                  <div class="form-field">
                    <label for="firstName" class="form-label">First Name</label>
                    <input v-model="form.firstName" type="text" id="firstName" class="form-input" :readonly="!isEditMode" />
                  </div>
                  <div class="form-field">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input v-model="form.lastName" type="text" id="lastName" class="form-input" :readonly="!isEditMode" />
                  </div>
                  <div class="form-field">
                    <label for="username" class="form-label">Username</label>
                    <input v-model="form.username" type="text" id="username" class="form-input" :readonly="!isEditMode" />
                  </div>
                  <div class="form-field">
                    <label for="email" class="form-label">Email</label>
                    <input v-model="form.email" type="email" id="email" class="form-input" readonly />
                  </div>
                  <div class="form-field">
                    <label for="gender" class="form-label">Gender</label>
                    <select v-model="form.gender" id="gender" class="form-select" :disabled="!isEditMode">
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label for="phone" class="form-label">Phone Number</label>
                    <div class="form-select-container">
                      <div class="phone-prefix">
                        <img src="/src/images/philippines-flag.png" alt="Philippines Flag" class="flag-icon" />
                        <span class="country-code">+63</span>
                      </div>
                      <input v-model="form.phone" type="tel" id="phone" class="form-select pl-16"
                        placeholder="9XX XXX XXXX" :readonly="!isEditMode" />
                    </div>
                  </div>
                  <div class="form-field">
                    <label for="dateOfBirth" class="form-label">Date of Birth</label>
                    <input v-model="form.dateOfBirth" type="date" id="dateOfBirth" class="form-select" :max="currentDate"
                      @change="calculateAge" :readonly="!isEditMode" />
                  </div>
                  <div class="form-field">
                    <label for="age" class="form-label">Age</label>
                    <input :value="form.age" type="text" id="age" class="form-select" readonly
                      :placeholder="form.dateOfBirth ? '' : 'Will be calculated from Date of Birth'" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Address Tab -->
            <div v-show="currentTab === 'address'" class="tab-content">
              <div class="info-section">
                <div class="form-grid">
                  <div class="form-field">
                    <label for="houseStreet" class="form-label">House No./Street</label>
                    <input v-model="form.address.houseStreet" type="text" id="houseStreet" class="form-input" :readonly="!isEditMode" />
                  </div>
                  <div class="form-field">
                    <label for="province" class="form-label">Province</label>
                    <select v-model="form.address.province" @change="updateCities" id="province" class="form-select" :disabled="!isEditMode">
                      <option value="" disabled>Select Province</option>
                      <option v-for="(cities, province) in addressData" :key="province" :value="province">{{ province }}</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label for="city" class="form-label">City</label>
                    <select v-model="form.address.city" @change="updateBarangays" id="city" class="form-select" :disabled="!isEditMode">
                      <option value="" disabled>Select City</option>
                      <option v-for="city in cities" :key="city.name" :value="city.name">{{ city.name }}</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label for="barangay" class="form-label">Barangay</label>
                    <select v-model="form.address.barangay" id="barangay" class="form-select" :disabled="!isEditMode">
                      <option value="" disabled>Select Barangay</option>
                      <option v-for="barangay in barangays" :key="barangay" :value="barangay">{{ barangay }}</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label for="postalCode" class="form-label">Postal Code</label>
                    <input v-model="form.address.postalCode" type="text" id="postalCode" class="form-input" :readonly="!isEditMode" />
                  </div>
                  <div class="form-field">
                    <label for="country" class="form-label">Country</label>
                    <input v-model="form.address.country" type="text" id="country" class="form-input" readonly />
                  </div>
                </div>
              </div>
            </div>

           <!-- Medical Tab -->
            <div v-show="currentTab === 'medical'" class="tab-content">
              <div class="info-section">
                <!-- Pagination Indicator -->
                <div class="pagination-steps">
                  <div class="steps-container">
                    <template v-for="page in 3" :key="page">
                      <div 
                        class="step-item"
                        :class="{ 
                          'active': currentPage === page,
                          'completed': isPageComplete(page - 1) 
                        }"
                      >
                        <div class="step-number">{{ page }}</div>
                        <div class="step-label">{{ getStepLabel(page) }}</div>
                      </div>
                      <!-- Connector line between steps -->
                      <div 
                        v-if="page < 3" 
                        class="step-connector"
                        :class="{ 
                          'active': currentPage > page,
                          'completed': isPageComplete(page)
                        }"
                      ></div>
                    </template>
                  </div>
                </div>
                <!-- Medical Questions Form -->
                <div class="medical-form">
                  <!-- Page 1 -->
                  <div v-show="currentPage === 1" class="form-page">
                    <!-- Allergies -->
                    <div class="form-group">
                      <label class="form-label">Do you have an allergy?</label>
                      <div class="radio-group">
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasAllergies" 
                            :value="true"
                            :disabled="!isEditMode"
                          >
                          Yes
                        </label>
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasAllergies" 
                            :value="false"
                            :disabled="!isEditMode"
                          >
                          No
                        </label>
                      </div>
                      <select 
                        v-if="form.medical.hasAllergies"
                        v-model="form.medical.allergyType"
                        class="form-select mt-3"
                        :disabled="!isEditMode"
                      >
                        <option value="" disabled>Select allergy type</option>
                        <option value="skin">Skin allergy (e.g., eczema, dermatitis)</option>
                        <option value="food">Food allergy</option>
                        <option value="medication">Medication allergy</option>
                        <option value="pollen">Pollen or environmental allergy</option>
                        <option value="other">Other (please specify)</option>
                      </select>
                      <input
                        v-if="form.medical.allergyType === 'other'"
                        v-model="form.medical.otherAllergySpecification"
                        type="text"
                        class="form-input mt-3"
                        placeholder="Please specify"
                        :readonly="!isEditMode"
                      />
                    </div>

                    <!-- Chronic Conditions -->
                    <div class="form-group">
                      <label class="form-label">Do you have chronic conditions?</label>
                      <div class="radio-group">
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasChronicConditions" 
                            :value="true"
                            :disabled="!isEditMode"
                          >
                          Yes
                        </label>
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasChronicConditions" 
                            :value="false"
                            :disabled="!isEditMode"
                          >
                          No
                        </label>
                      </div>
                      <select 
                        v-if="form.medical.hasChronicConditions"
                        v-model="form.medical.chronicConditionType"
                        class="form-select mt-3"
                        :disabled="!isEditMode"
                      >
                        <option value="" disabled>Select condition type</option>
                        <option value="diabetes">Diabetes</option>
                        <option value="hypertension">Hypertension</option>
                        <option value="autoimmune">Autoimmune diseases (e.g., lupus, psoriasis)</option>
                        <option value="asthma">Asthma</option>
                        <option value="heart">Heart conditions</option>
                        <option value="other">Other (please specify)</option>
                      </select>
                      <input
                        v-if="form.medical.chronicConditionType === 'other'"
                        v-model="form.medical.otherConditionSpecification"
                        type="text"
                        class="form-input mt-3"
                        placeholder="Please specify"
                        :readonly="!isEditMode"
                      />
                    </div>

                    <!-- Skin Conditions -->
                    <div class="form-group">
                      <label class="form-label">Do you currently have any skin conditions?</label>
                      <div class="radio-group">
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasSkinConditions" 
                            :value="true"
                            :disabled="!isEditMode"
                          >
                          Yes
                        </label>
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasSkinConditions" 
                            :value="false"
                            :disabled="!isEditMode"
                          >
                          No
                        </label>
                      </div>
                      <div v-if="form.medical.hasSkinConditions" class="checkbox-group mt-3">
                        <label v-for="condition in skinConditions" :key="condition.value" class="checkbox-label">
                          <input
                            type="checkbox"
                            v-model="form.medical.selectedSkinConditions"
                            :value="condition.value"
                            :disabled="!isEditMode"
                          >
                          {{ condition.label }}
                        </label>
                        <div v-if="form.medical.selectedSkinConditions.includes('other')" class="mt-2">
                          <input
                            v-model="form.medical.otherSkinConditionSpecification"
                            type="text"
                            class="form-input"
                            placeholder="Please specify other skin conditions"
                            :readonly="!isEditMode"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Page 2 -->
                  <div v-show="currentPage === 2" class="form-page">
                    <!-- Skin Type -->
                    <div class="form-group">
                      <label class="form-label">What is your skin type?</label>
                      <select 
                        v-model="form.medical.skinType"
                        class="form-select"
                        :disabled="!isEditMode"
                      >
                        <option value="" disabled>Select skin type</option>
                        <option value="oily">Oily</option>
                        <option value="dry">Dry</option>
                        <option value="combination">Combination</option>
                        <option value="sensitive">Sensitive</option>
                      </select>
                    </div>

                    <!-- Previous Treatments -->
                    <div class="form-group">
                      <label class="form-label">Have you undergone any cosmetic or dermatological treatments before?</label>
                      <div class="radio-group">
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasPreviousTreatments" 
                            :value="true"
                            :disabled="!isEditMode"
                          >
                          Yes
                        </label>
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasPreviousTreatments" 
                            :value="false"
                            :disabled="!isEditMode"
                          >
                          No
                        </label>
                      </div>
                      <div v-if="form.medical.hasPreviousTreatments" class="checkbox-group mt-3">
                        <label v-for="treatment in treatments" :key="treatment.value" class="checkbox-label">
                          <input
                            type="checkbox"
                            v-model="form.medical.selectedTreatments"
                            :value="treatment.value"
                            :disabled="!isEditMode"
                          >
                          {{ treatment.label }}
                        </label>
                        <div v-if="form.medical.selectedTreatments.includes('other')" class="mt-2">
                          <input
                            v-model="form.medical.otherTreatmentSpecification"
                            type="text"
                            class="form-input"
                            placeholder="Please specify other treatments"
                            :readonly="!isEditMode"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Current Medications -->
                    <div class="form-group">
                      <label class="form-label">Are you currently taking any medications?</label>
                      <div class="radio-group">
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasMedications" 
                            :value="true"
                            :disabled="!isEditMode"
                          >
                          Yes
                        </label>
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasMedications" 
                            :value="false"
                            :disabled="!isEditMode"
                          >
                          No
                        </label>
                      </div>
                      <textarea
                        v-if="form.medical.hasMedications"
                        v-model="form.medical.medications"
                        class="form-textarea mt-3"
                        placeholder="Please list your current medications"
                        :readonly="!isEditMode"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Page 3 -->
                  <div v-show="currentPage === 3" class="form-page">
                    <!-- Daily Skincare Routine -->
                    <div class="form-group">
                      <label class="form-label">Do you follow a daily skincare routine?</label>
                      <div class="radio-group">
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasSkincareRoutine" 
                            :value="true"
                            :disabled="!isEditMode"
                          >
                          Yes
                        </label>
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.hasSkincareRoutine" 
                            :value="false"
                            :disabled="!isEditMode"
                          >
                          No
                        </label>
                      </div>
                      <div v-if="form.medical.hasSkincareRoutine" class="checkbox-group mt-3">
                        <label v-for="product in skincareProducts" :key="product.value" class="checkbox-label">
                          <input
                            type="checkbox"
                            v-model="form.medical.selectedSkincareProducts"
                            :value="product.value"
                            :disabled="!isEditMode"
                          >
                          {{ product.label }}
                        </label>
                      </div>
                    </div>

                    <!-- Pregnancy and Breastfeeding -->
                    <div class="form-group">
                      <label class="form-label">Are you currently pregnant or breastfeeding? (for female clients)</label>
                      <div class="radio-group">
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.isPregnantOrBreastfeeding" 
                            :value="true"
                            :disabled="!isEditMode"
                          >
                          Yes
                        </label>
                        <label class="radio-label">
                          <input 
                            type="radio" 
                            v-model="form.medical.isPregnantOrBreastfeeding" 
                            :value="false"
                            :disabled="!isEditMode"
                          >
                          No
                        </label>
                      </div>
                    </div>

                    <!-- Main Goals -->
                    <div class="form-group">
                      <label class="form-label">What are your main goals for visiting Mejico MedSpa?</label>
                      <div class="checkbox-group">
                        <label v-for="goal in spaGoals" :key="goal.value" class="checkbox-label">
                          <input
                            type="checkbox"
                            v-model="form.medical.selectedSpaGoals"
                            :value="goal.value"
                            :disabled="!isEditMode"
                          >
                          {{ goal.label }}
                        </label>
                        <div v-if="form.medical.selectedSpaGoals.includes('other')" class="mt-2">
                          <input
                            v-model="form.medical.otherSpaGoalSpecification"
                            type="text"
                            class="form-input"
                            placeholder="Please specify other goals"
                            :readonly="!isEditMode"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Additional Information -->
                    <div class="form-group">
                      <label class="form-label">Is there anything else we should know about your health or skin?</label>
                      <textarea
                        v-model="form.medical.additionalInformation"
                        class="form-textarea"
                        placeholder="Please provide any additional information"
                        :readonly="!isEditMode"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Navigation Buttons -->
                  <div class="navigation-buttons">
                    <button 
                      type="button" 
                      class="nav-btn prev-btn" 
                      :disabled="isEditMode || currentPage === 1"
                      @click="previousPage"
                    >
                      Previous
                    </button>
                    <button 
                      type="button" 
                      class="nav-btn next-btn" 
                      :disabled="isEditMode || currentPage === 3 || !isPageComplete(currentPage - 1)"
                      @click="nextPage"
                    >
                      {{ currentPage === 3 ? 'Finish' : 'Next' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

              <!-- Treatment History Tab -->
              <div v-show="currentTab === 'treatment'" class="tab-content">
                <div class="info-section">
                  <h2 class="section-title flex items-center">
                    <HistoryIcon class="w-5 h-5 mr-2" />
                    Treatment History
                  </h2>
                  <div class="treatment-history-grid">
                    <div v-for="appointment in pastAppointments" 
                        :key="appointment.id" 
                        class="treatment-card">
                      <div class="treatment-card-content">
                        <div class="treatment-header">
                          <h3 class="treatment-services">
                            {{ formatServices(appointment.services) }}
                          </h3>
                          <span :class="[
                            'status-badge',
                            appointment.status.toLowerCase() === 'approved' ? 'status-approved' : 'status-pending'
                          ]">
                            {{ appointment.status.toUpperCase() }}
                          </span>
                        </div>
                        <div class="treatment-details">
                          <div class="detail-item">
                            <CalendarIcon class="w-4 h-4 text-gray-500" />
                            <span>Date: {{ formatDate(appointment.date) }}</span>
                          </div>
                          <div class="detail-item">
                            <ClockIcon class="w-4 h-4 text-gray-500" />
                            <span>Time: {{ appointment.time }}</span>
                          </div>
                          <div class="detail-item">
                            <DollarSignIcon class="w-4 h-4 text-gray-500" />
                            <span>Price: ₱{{ appointment.price }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="pastAppointments.length === 0" class="no-appointments">
                      <HistoryIcon class="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p class="text-gray-500 text-sm">No past appointments found</p>
                    </div>
                  </div>
                </div>
              </div>

            <!-- Submit Button -->
            <div class="submit-button-container" v-if="isEditMode">
              <button type="submit" class="submit-btn">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Popup Notification -->
  <Transition name="fade">
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup-content" :class="{ error: popupError }">
        <div class="popup-icon-container">
          <Transition name="icon-change" mode="out-in">
            <CheckIcon v-if="popupSaved" class="popup-icon check" />
            <LoaderIcon v-else class="popup-icon loader" />
          </Transition>
        </div>
        <p>{{ popupMessage }}</p>
      </div>
    </div>
  </Transition>

  <FooterComponent />
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../firebase';
import Navbar from './Navbar.vue';
import FooterComponent from './Footer.vue';
import { UserIcon, HistoryIcon, MailIcon, PencilIcon, CalendarIcon, ClockIcon, DollarSignIcon } from 'lucide-vue-next';
import { User } from 'lucide-vue-next';
import { CheckIcon, LoaderIcon } from 'lucide-vue-next';

// Address data for Oriental Mindoro
const addressData = {
  "Oriental Mindoro": [
    { name: "Puerto Galera", barangays: ["Aninuan", "Baclayan", "Balatero", "Dulangan", "Palangan", "Poblacion", "Sabang", "San Antonio", "San Isidro", "Santo Niño", "Sinandigan", "Tabinay", "Villaflor"], postalCode: "5203" },
    { name: "San Teodoro", barangays: ["Bigaan", "Calangatan", "Calsapa", "Ilag", "Lumangbayan", "Tacligan", "Poblacion", "Caagutayan"], postalCode: "5202" },
    { name: "Calapan City", barangays: ["Balingayan", "Balite", "Baruyan", "Batino", "Bayanan I", "Bayanan II", "Biga", "Bondoc", "Bucayao", "Buhuan", "Bulusan", "Calero", "Camansihan", "Camilmil", "Canubing I", "Canubing II", "Comunal", "Guinobatan", "Gulod", "Gutad", "Ibaba East", "Ibaba West", "Ilaya", "Lalud", "Lazareto", "Libis", "Lumangbayan", "Mahal Na Pangalan", "Maidlang", "Malad", "Malamig", "Managpi", "Masipit", "Nag-Iba I", "Nag-Iba II", "Navotas", "Pachoca", "Palhi", "Panggalaan", "Parang", "Patas", "Personas", "Putting Tubig", "San Antonio", "San Raphael (formerly Salong)", "San Vicente Central", "San Vicente East", "San Vicente North", "San Vicente South", "San Vicente West", "Sapul", "Silonay", "Sta. Cruz", "Sta. Isabel", "Sta. Maria Village", "Sta. Rita", "Sto. Niño (formerly Nacoco)", "Suqui", "Tawagan", "Tawiran", "Tibag", "Wawa"], postalCode: "5200" },
    { name: "Baco", barangays: [], postalCode: "5201" },
    { name: "Naujan", barangays: ["Adrialuna", "Andres Ylagan (Mag-asawang Tubig)", "Antipolo", "Apitong", "Arangin", "Aurora", "Bacungan", "Bagong Buhay", "Balite", "Bancuro", "Banuton", "Barcenaga", "Bayani", "Buhangin", "Caburo", "Concepcion", "Dao", "Del Pilar", "Estrella", "Evangelista", "Gamao", "General Esco", "Herrera", "Inarawan", "Kalinisan", "Laguna", "Mabini", "Magtibay", "Mahabang Parang", "Malabo", "Malaya", "Malinao", "Malvar", "Masagana", "Masaguing", "Melgar A", "Melgar B", "Metolza", "Montelago", "Montemayor", "Motoderazo", "Mulawin", "Nag-Iba I", "Nag-Iba II", "Pagkakaisa", "Paitan", "Paniquian", "Pinagsabangan I", "Pinagsabangan II", "Pinahan", "Poblacion I Barangay I)", "Poblacion II (Barangay II)", "Poblacion III Barangay III)", "Sampaguita", "San Agustin I", "San Agustin II", "San Andres", "San Antonio", "San Carlos", "San Isidro", "San Jose", "San Luis", "San Nicolas", "San Pedro", "Santa Cruz", "Santa Isabel", "Santa Maria", "Santiago", "Santo Nino", "Tagumpay", "Tigkan"], postalCode: "5204" },
    { name: "Victoria", barangays: ["Alcate", "Antonino (Mainao)", "Babangonan", "Bagong Buhay", "Bagong Silang", "Bambanin", "Bethel", "Canaan", "Concepcion", "Duongan", "Leido", "Loyal", "Mabini", "Macatoc", "Malabo", "Merit", "Ordovilla", "Pakyas", "Poblacion I", "Poblacion II", "Poblacion III", "Poblacion IV", "Sampaguita", "San Antonio", "San Cristobal", "San Gabriel", "San Gelacio", "San Isidro", "San Juan", "San Narciso", "Urdaneta", "Villa Cerveza"], postalCode: "5205" },
    { name: "Socorro", barangays: ["Batong Dalig", "Bayuin", "Bugtong Na Tuog", "Calocmoy", "Calubayan", "Catiningan", "Epiz (Bagsok)", "Happy Valley", "La Fortuna (Putol)", "Leuteboro I", "Leuteboro II", "Mabuhay I", "Mabuhay II", "Malugay", "Maria Concepcion", "Matungao", "Monteverde", "Pasi I", "Pasi II", "Santo Domingo (Lapog)", "Subaan", "Villareal (Daan)", "Zone I (Pob.)", "Zone II (Pob.)", "Zone III (Pob.)", "Zone IV (Pob.)"], postalCode: "5207" },
    { name: "Pola", barangays: ["Bacauan", "Bacungan", "Batuhan", "Bayanan", "Biga", "Buhay na Tubig", "Calubasanhon", "Calima", "Casiligan", "Malibago", "Maluanluan", "Matulatula", "Pahilahan", "Panikihan", "Zone I (Poblacion)", "Zone II (Poblacion)", "Pula", "Puting Cacao", "Tagbakin", "Tagumpay", "Tiguihan", "Campamento", "Misong"], postalCode: "5206" },
    { name: "Pinamalayan", barangays: ["Bangbang", "Banilad", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Biga", "Cacawan", "Del", "Mariano", "Marfrancisco", "Mina de Oro", "Nabuslot", "Pag-asa", "Palayan", "Pambisan", "Papandayan", "Pasi", "Rizal", "San Jose", "San Rafael", "Santa Maria", "Tibog"], postalCode: "5208" },
  ],
};

const profileImage = ref(null);
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  age: '',
  address: {
    houseStreet: '',
    barangay: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'Philippines',
  },
  medical: {
    hasAllergies: false,
    allergyType: '',
    otherAllergySpecification: '',
    hasChronicConditions: false,
    chronicConditionType: '',
    otherConditionSpecification: '',
    hasSkinConditions: false,
    selectedSkinConditions: [],
    otherSkinConditionSpecification: '',
    skinType: '',
    hasPreviousTreatments: false,
    selectedTreatments: [],
    otherTreatmentSpecification: '',
    hasMedications: false,
    medications: '',
    hasSkincareRoutine: false,
    selectedSkincareProducts: [],
    isPregnantOrBreastfeeding: false,
    selectedSpaGoals: [],
    otherSpaGoalSpecification: '',
    additionalInformation: '',
  },
});

// Data for dynamic dropdowns
const cities = ref([]);
const barangays = ref([]);

// Popup notification
const showPopup = ref(false);
const popupMessage = ref('');
const popupError = ref(false);
const popupSaved = ref(false);

// Tabs data
const tabs = [
  { id: 'personal', name: 'Personal' },
  { id: 'address', name: 'Address' },
  { id: 'medical', name: 'Medical' },
  { id: 'treatment', name: 'Treatment History' }
];

const currentTab = ref('personal');
const isEditMode = ref(false);

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

// Function to update cities based on selected province
const updateCities = () => {
  const province = form.address.province;
  cities.value = addressData[province] || [];
};

// Function to update barangays and postal code based on selected city
const updateBarangays = () => {
  const city = cities.value.find(c => c.name === form.address.city);
  barangays.value = city ? city.barangays : [];
  form.address.postalCode = city ? city.postalCode : '';
};

const fullName = computed(() => {
  return `${form.firstName} ${form.lastName}`.trim() || 'Your Name';
});

const userEmail = computed(() => {
  return form.email || 'username@email.com';
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      displayPopup('Image size should be less than 5MB', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target.result;
    };
    reader.onerror = (e) => {
      displayPopup('Error reading file', true);
    };
    reader.readAsDataURL(file);
  }
};

const displayPopup = (message, isError = false, duration = 3000) => {
  popupMessage.value = message;
  popupError.value = isError;
  showPopup.value = true;
  popupSaved.value = false;

  if (!isError) {
    setTimeout(() => {
      popupSaved.value = true;
    }, 1000);
  }

  setTimeout(() => {
    showPopup.value = false;
    popupSaved.value = false;
  }, duration);
};

const validateForm = () => {
  if (!form.firstName || !form.lastName || !form.email) {
    displayPopup('Please fill in all required fields', true);
    return false;
  }
  // Add more validation as needed
  return true;
};

const submitForm = async () => {
  if (!validateForm()) return;

  displayPopup('Saving...', false);
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      const userDocRef = doc(database, "users", user.uid);
      await setDoc(userDocRef,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          phone: form.phone,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          age: form.age,
          address: form.address,
          medical: form.medical,
          profileImage: profileImage.value
        },
        { merge: true }
      );
      displayPopup('Successfully saved!', false);
      isEditMode.value = false;
    } catch (error) {
      console.error("Error saving user data:", error);
      displayPopup('Error saving data. Please try again.', true);
    }
  } else {
    console.error("No authenticated user found");
    displayPopup('Error: No authenticated user found.', true);
  }
};

// Modified pastAppointments computed property
const pastAppointments = computed(() => {
  const currentDate = new Date();
  return approvedAppointments.value
    .filter(appointment => {
      // Ensure we're comparing Date objects
      const appointmentDate = appointment.date instanceof Date 
        ? appointment.date 
        : new Date(appointment.date);
      return appointmentDate < currentDate;
    })
    .sort((a, b) => b.date - a.date); // Sort by date descending
});

const approvedAppointments = ref([]);

// Modify the fetchApprovedAppointments function
const fetchApprovedAppointments = async (userId) => {
  try {
    const appointmentsRef = collection(database, 'appointments');
    const q = query(
      appointmentsRef,
      where('userId', '==', userId),
      where('status', 'in', ['approved', 'pending'])
    );
    const querySnapshot = await getDocs(q);

    const appointments = [];
    for (const doc of querySnapshot.docs) {
      const appointmentData = doc.data();
      
      // Convert Firestore timestamp to Date
      let appointmentDate;
      if (appointmentData.date && typeof appointmentData.date.toDate === 'function') {
        appointmentDate = appointmentData.date.toDate();
      } else if (appointmentData.date) {
        appointmentDate = new Date(appointmentData.date);
      }

      if (appointmentDate) {
        appointments.push({
          id: doc.id,
          date: appointmentDate,
          time: appointmentData.time || 'No time specified',
          services: appointmentData.services || [],
          price: appointmentData.price || 0,
          status: appointmentData.status || 'pending'
        });
      }
    }

    // Sort appointments by date in descending order
    appointments.sort((a, b) => b.date - a.date);
    approvedAppointments.value = appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};

// Add this helper function to format services
const formatServices = (services) => {
  if (!services || !Array.isArray(services)) return 'No services';
  return services.join(', ').toUpperCase();
};

// Update the formatDate function to match the desired format
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const memberSince = computed(() => {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
});

const calculateProfileCompletion = computed(() => {
  let totalFields = 0;
  let completedFields = 0;

  // Personal Information
  const personalFields = {
    firstName: form.firstName,
    lastName: form.lastName,
    username: form.username,
    phone: form.phone,
    gender: form.gender,
    dateOfBirth: form.dateOfBirth,
  };

  // Address Information
  const addressFields = {
    houseStreet: form.address.houseStreet,
    barangay: form.address.barangay,
    city: form.address.city,
    province: form.address.province,
  };

  // Medical Information
  const medicalFields = {
    hasAllergies: form.medical.hasAllergies,
    hasMedications: form.medical.hasMedications,
    hasChronicConditions: form.medical.hasChronicConditions,
    hasSkinConditions: form.medical.hasSkinConditions,
    skinType: form.medical.skinType,
    hasPreviousTreatments: form.medical.hasPreviousTreatments,
    hasSkincareRoutine: form.medical.hasSkincareRoutine,
    isPregnantOrBreastfeeding: form.medical.isPregnantOrBreastfeeding,
    selectedSpaGoals: form.medical.selectedSpaGoals,
    additionalInformation: form.medical.additionalInformation,
  };

  // Count personal fields
  totalFields += Object.keys(personalFields).length;
  completedFields += Object.values(personalFields).filter(value => value && value.toString().trim() !== '').length;

  // Count address fields
  totalFields += Object.keys(addressFields).length;
  completedFields += Object.values(addressFields).filter(value => value && value.toString().trim() !== '').length;

  // Count medical fields
  totalFields += Object.keys(medicalFields).length;
  completedFields += Object.values(medicalFields).filter(value => {
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    return value && value.toString().trim() !== '';
  }).length;

  // Add profile image to the calculation
  totalFields += 1;
  if (profileImage.value) completedFields += 1;

  // Calculate percentage
  const percentage = Math.round((completedFields / totalFields) * 100);
  return percentage;
});

// Update the completion message based on the percentage
const completionMessage = computed(() => {
  const percentage = calculateProfileCompletion.value;
  if (percentage === 100) return 'Profile complete! 🎉';
  if (percentage >= 75) return 'Almost there! Fill in the remaining fields';
  if (percentage >= 50) return 'Good progress! Keep going';
  if (percentage >= 25) return 'Getting started! Complete more fields';
  return 'Complete your profile for better service';
});

// Medical tab pagination
const currentPage = ref(1);
const totalPages = 3;
const props = defineProps(['isEditMode']);

// Skin conditions and treatments data
const skinConditions = [
  { value: 'acne', label: 'Acne' },
  { value: 'rosacea', label: 'Rosacea' },
  { value: 'psoriasis', label: 'Psoriasis' },
  { value: 'eczema', label: 'Eczema' },
  { value: 'pigmentation', label: 'Dark spots or pigmentation' },
  { value: 'wrinkles', label: 'Wrinkles or fine lines' },
  { value: 'other', label: 'Other' }
];

const treatments = [
  { value: 'botox', label: 'Botox or fillers' },
  { value: 'chemical_peels', label: 'Chemical peels' },
  { value: 'laser', label: 'Laser treatments' },
  { value: 'microdermabrasion', label: 'Microdermabrasion' },
  { value: 'chemical_peel', label: 'Chemical Peel' },
  { value: 'resurfacing', label: 'Skin resurfacing' },
  { value: 'other', label: 'Other' }
];

const skincareProducts = [
  { value: 'cleanser', label: 'Cleanser' },
  { value: 'toner', label: 'Toner' },
  { value: 'moisturizer', label: 'Moisturizer' },
  { value: 'sunscreen', label: 'Sunscreen' },
  { value: 'serums', label: 'Serums or treatments' },
];

const spaGoals = [
  { value: 'skinHealth', label: 'Improve skin health' },
  { value: 'skinIssues', label: 'Address specific skin issues' },
  { value: 'relaxation', label: 'Relaxation and stress relief' },
  { value: 'antiAging', label: 'Anti-aging treatments' },
  { value: 'other', label: 'Other (please specify)' },
];

// Current date for max attribute of date input
const currentDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Function to calculate age
const calculateAge = () => {
  if (form.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(form.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    form.age = age.toString();
  }
};

// Watch for changes in dateOfBirth and recalculate age
watch(() => form.dateOfBirth, calculateAge);

// Existing phone number formatting logic
watch(() => form.phone, (newValue) => {
  let cleaned = newValue.replace(/\D/g, '');
  cleaned = cleaned.slice(0, 10);
  if (cleaned.length > 6) {
    form.phone = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length > 3) {
    form.phone = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  } else {
    form.phone = cleaned;
  }
});

// Function to fetch user data
const fetchUserData = async (userId) => {
  try {
    const userDocRef = doc(database, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Safely assign data with default values
      form.firstName = userData.firstName || '';
      form.lastName = userData.lastName || '';
      form.email = userData.email || '';
      form.username = userData.username || '';
      form.phone = userData.phone || '';
      form.gender = userData.gender || '';
      form.dateOfBirth = userData.dateOfBirth || '';
      form.age = userData.age || '';
      
      // Safely assign medical data
      form.medical = {
        ...form.medical, // Keep default structure
        ...(userData.medical || {}) // Merge with fetched data if exists
      };
      
      // Safely assign address data
      if (userData.address) {
        form.address = {
          ...form.address, // Keep default structure
          ...userData.address // Merge with fetched data
        };
        
        // Update dependent fields
        if (form.address.province) {
          updateCities();
          if (form.address.city) {
            updateBarangays();
          }
        }
      }
      
      // Set profile image if exists
      if (userData.profileImage) {
        profileImage.value = userData.profileImage;
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    displayPopup('Error loading user data', true);
  }
};

// Modified onMounted to use the new fetch function
onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await fetchUserData(user.uid);
      await fetchApprovedAppointments(user.uid);
    }
  });
});

// Function to switch tabs
const switchTab = (tabId) => {
  currentTab.value = tabId;
};

const getStepLabel = (page) => {
  switch (page) {
    case 1: return 'Basic Health';
    case 2: return 'Skin & Treatment';
    case 3: return 'Additional Info';
    default: return '';
  }
};

const isPageComplete = (pageIndex) => {
  switch (pageIndex) {
    case 0: // First page validation
      return (
        typeof form.medical.hasAllergies === 'boolean' &&
        (!form.medical.hasAllergies || form.medical.allergyType) &&
        typeof form.medical.hasChronicConditions === 'boolean' &&
        (!form.medical.hasChronicConditions || form.medical.chronicConditionType) &&
        typeof form.medical.hasSkinConditions === 'boolean' &&
        (!form.medical.hasSkinConditions || form.medical.selectedSkinConditions.length > 0)
      );
    case 1: // Second page validation
      return (
        form.medical.skinType &&
        typeof form.medical.hasPreviousTreatments === 'boolean' &&
        typeof form.medical.hasMedications === 'boolean' &&
        (!form.medical.hasMedications || form.medical.medications)
      );
    case 2: // Third page validation
      return (
        typeof form.medical.hasSkincareRoutine === 'boolean' &&
        typeof form.medical.isPregnantOrBreastfeeding === 'boolean' &&
        form.medical.selectedSpaGoals.length > 0
      );
    default:
      return false;
  }
};

const previousPage = () => {
  if (currentPage > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage < 3 && isPageComplete(currentPage - 1)) {
    currentPage.value++;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.container {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  width: 100%;
  max-width: 1400px;
  margin: 150px auto 50px;
}

.card {
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.182);
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card.flex-row {
  flex-direction: row;
  min-height: 700px;
}

/* Profile Sidebar */
.profile-sidebar {
  background: linear-gradient(135deg, #6656b3 0%, #4b3b8f 100%);
  color: #ffffff;
  padding: 2rem;
  width: 30%;
  min-width: 300px;
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.profile-header {
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
}

.profile-img-container {
  position: relative;
  width: 10rem;
  height: 10rem;
  margin: 0 auto 1rem;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 0.25rem solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
}

.change-pic {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #ffffff;
  color: #6656b3;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.change-pic:hover {
  transform: scale(1.1);
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.profile-role {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
}

.completion-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.25rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
  width: 100%;
  max-width: 380px;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.completion-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.completion-percentage {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
}

.completion-bar-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  height: 0.5rem;
  overflow: hidden;
  margin: 0.75rem 0;
}

.completion-bar {
  height: 100%;
  background: #ffffff;
  border-radius: 0.75rem;
  transition: width 0.5s ease-out;
  position: relative;
}

.completion-message {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.completion-message.is-complete {
  color: white;
  font-weight: 500;
}

.completion-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: glow 2s infinite;
}

@keyframes glow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

.divider-line {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 1rem 0;
}

.profile-info {
  width: 100%;
}

.profile-detail {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.profile-detail svg {
  margin-right: 0.5rem;
}

/* Main Content Area */
.profile-main-content {
  padding: 2rem;
  width: 70%;
  display: flex;
  flex-direction: column;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  color: #374151;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-profile-btn:hover {
  background-color: #e5e7eb;
}

/* Tabs Navigation */
.tabs-navigation {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #6656b3;
}

.tab-button.active {
  color: #6656b3;
  border-bottom-color: #6656b3;
}

/* Tab Content */
.tab-content-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tab-content {
  display: none;
}

.tab-content:not([style*="display: none"]) {
  display: block;
}

.info-section {
  background: #f3f4f6;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: inset 0px 4px 10px rgba(0, 0, 0, 0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #1f2937;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6656b3;
  box-shadow: 0 0 0 3px rgba(102, 86, 179, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 6rem;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
}

/* Submit Button */
.submit-button-container {
  margin-top: 2rem;
}

.submit-btn {
  width: 100%;
  background-color: #6656b3;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #5a4ca0;
}

/* Treatment History */
.treatment-history {
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
}

.treatment-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.treatment-date {
  font-weight: 600;
  color: #6656b3;
}

/* Popup Notification */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 20rem;
}

.popup-content.error {
  background-color: #fee2e2;
  color: #ef4444;
}

.popup-icon-container {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  background-color: #6656b3;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-icon {
  width: 2rem;
  height: 2rem;
  color: #ffffff;
}

.popup-icon.loader {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Icon change transition */
.icon-change-enter-active,
.icon-change-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.icon-change-enter-from,
.icon-change-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Additional styles for new fields */
.form-select-container {
  position: relative;
}

.phone-prefix {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  pointer-events: none;
}

.flag-icon {
  width: 1.25rem;
  height: 0.875rem;
  object-fit: cover;
  border-radius: 2px;
}

.country-code {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-select.pl-16 {
  padding-left: 4rem;
}

/* Medical Form Styles */
.medical-form {
  margin-bottom: 1.5rem;
}

.form-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fade-in 0.3s ease-out;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.nav-btn {
  background-color: #6656b3;
  color: white;
  border-radius: 0.375rem;
  transition: background-color 0.3s;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background-color: #5a4ca0;
}
.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.prev-btn {
  background-color: #f3f4f6;
  color: #374151;
}

.prev-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.next-btn {
  background-color: #6656b3;
  color: white;
}

.next-btn:hover:not(:disabled) {
  background-color: #4b3b8f;
}

.pagination-indicator {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.indicator-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: #d1d5db;
  cursor: pointer;
  transition: background-color 0.3s;
}

.indicator-dot.active {
  background-color: #6656b3;
}

.pagination-steps {
  margin: 2rem 0;
  padding: 1rem;
}

.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: 2px solid #d1d5db;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step-label {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.step-connector {
  width: 8rem;
  height: 2px;
  background-color: #d1d5db;
  margin: 0 -1rem;
  position: relative;
  top: -1.25rem;
  transition: background-color 0.3s ease;
}

/* Active state */
.step-item.active .step-number {
  background-color: #6656b3;
  border-color: #6656b3;
  color: white;
}

.step-item.active .step-label {
  color: #6656b3;
}

/* Completed state */
.step-item.completed .step-number {
  background-color: #4b3b8f;
  border-color: #4b3b8f;
  color: white;
}

.step-connector.completed,
.step-connector.active {
  background-color: #6656b3;
}

/* Add these new styles */
.treatment-history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.treatment-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.treatment-card:hover {
  transform: translateY(-2px);
}

.treatment-card-content {
  padding: 1rem;
}

.treatment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.treatment-services {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  flex: 1;
  margin-right: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-approved {
  background-color: #dcfce7;
  color: #166534;
}

.status-pending {
  background-color: #fff7ed;
  color: #9a3412;
}

.treatment-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.no-appointments {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
}


@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .card.flex-row {
    flex-direction: column;
  }

  .profile-sidebar,
  .profile-main-content {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .step-connector {
    width: 4rem;
  }

  .step-label {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0.5rem;
  }

  .card {
    border-radius: 0;
  }

  .main-title {
    font-size: 2rem;
  }

  .tabs-navigation {
    flex-wrap: wrap;
  }

  .tab-button {
    flex-grow: 1;
    text-align: center;
  }

  .completion-card {
    max-width: 100%;
    padding: 1.25rem;
  }

  .completion-title {
    font-size: 0.85rem;
  }

  .completion-percentage {
    font-size: 0.9rem;
  }
}
</style>