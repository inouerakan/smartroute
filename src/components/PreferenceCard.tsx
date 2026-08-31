import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "./Text";

// ─── Tipe Data ────────────────────────────────────────────────
interface PreferenceItemProps {
  label: string;
  value: string;
  onPress?: () => void;
  showBorder?: boolean;
}

interface PreferenceOption {
  id: string;
  label: string;
  value: string;
  options: string[];
}

// ─── Baris Preferensi ─────────────────────────────────────────
function PreferenceItem({
  label,
  value,
  onPress,
  showBorder = true,
}: PreferenceItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row justify-between items-center py-3.5 active:opacity-60 ${
        showBorder ? "border-b border-white/10" : ""
      }`}
    >
      <Text className="text-light-2 text-sm font-medium">{label}</Text>
      <View className="flex-row items-center gap-1.5 flex-1 justify-end ml-4">
        <Text
          className="text-light-1 text-sm font-semibold text-right"
          numberOfLines={1}
        >
          {value}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
      </View>
    </Pressable>
  );
}

// ─── Modal Pilihan ────────────────────────────────────────────
interface OptionModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

function OptionModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop blur */}
      <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill}>
        <Pressable
          className="flex-1 justify-center items-center px-6 bg-black/40"
          onPress={onClose}
        >
          {/* Kartu modal — NativeWind sebanyak mungkin */}
          <Pressable
            onPress={() => {}}
            className="w-full max-w-[75%] bg-white rounded-2xl overflow-hidden"
            style={styles.shadow} // ← Hanya shadow yang pakai StyleSheet
          >
            {/* Judul */}
            <Text className="text-base font-bold text-slate-900 text-center pt-5 pb-3.5">
              {title}
            </Text>

            <View className="h-px bg-slate-100 mx-4" />

            {/* Pilihan */}
            {options.map((option, index) => {
              const isSelected = option === selectedValue;
              const isLast = index === options.length - 1;

              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                  className={`flex-row justify-between items-center px-6 py-4 active:bg-slate-50 ${
                    !isLast ? "border-b border-slate-100" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      isSelected
                        ? "text-blue-500 font-bold"
                        : "text-slate-700 font-semibold"
                    }`}
                  >
                    {option}
                  </Text>

                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Batal */}
            <TouchableOpacity
              onPress={onClose}
              className="items-center py-4 mt-1 border-t border-slate-100 active:bg-red-50"
            >
              <Text className="text-base font-semibold text-red-500">
                Batal
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </BlurView>
    </Modal>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────
export default function PreferenceCard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activePreference, setActivePreference] =
    useState<PreferenceOption | null>(null);

  const [preferences, setPreferences] = useState<PreferenceOption[]>([
    {
      id: "1",
      label: "Prioritas Utama",
      value: "Hemat",
      options: ["Hemat", "Cepat", "Nyaman"],
    },
    {
      id: "2",
      label: "Maks. Transit",
      value: "1x",
      options: ["Tanpa Transit", "1x", "2x", "Tidak Batas"],
    },
    {
      id: "3",
      label: "Moda Favorit",
      value: "MRT",
      options: ["MRT", "TransJakarta", "KRL", "Angkot", "Semua"],
    },
    {
      id: "4",
      label: "Maks. Jalan Kaki",
      value: "10 Menit",
      options: ["5 Menit", "10 Menit", "15 Menit", "20 Menit"],
    },
  ]);

  const handlePress = (item: PreferenceOption) => {
    setActivePreference(item);
    setModalVisible(true);
  };

  const handleSelect = (selectedValue: string) => {
    if (!activePreference) return;
    setPreferences((prev) =>
      prev.map((p) =>
        p.id === activePreference.id ? { ...p, value: selectedValue } : p,
      ),
    );
  };

  return (
    <View className="bg-dark-2 w-full px-5 py-4 rounded-2xl border border-white/10">
      <Text className="text-light-1 font-bold text-lg mb-1">
        Preferensi Perjalanan
      </Text>

      <View className="w-full">
        {preferences.map((item, index) => (
          <PreferenceItem
            key={item.id}
            label={item.label}
            value={item.value}
            showBorder={index !== preferences.length - 1}
            onPress={() => handlePress(item)}
          />
        ))}
      </View>

      <OptionModal
        visible={modalVisible}
        title={activePreference?.label ?? ""}
        options={activePreference?.options ?? []}
        selectedValue={activePreference?.value ?? ""}
        onSelect={handleSelect}
        onClose={() => {
          setModalVisible(false);
          setActivePreference(null);
        }}
      />
    </View>
  );
}

// ─── StyleSheet MINIMAL — hanya untuk yang tidak bisa NativeWind ──
const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
});
