import 'package:flutter/material.dart';

class DOMSSurveyCard extends StatefulWidget {
  final Function(DOMSSurveyData) onSubmit;
  final DOMSSurveyData? initialData;
  final bool isExpanded;

  const DOMSSurveyCard({
    Key? key,
    required this.onSubmit,
    this.initialData,
    this.isExpanded = false,
  }) : super(key: key);

  @override
  State<DOMSSurveyCard> createState() => _DOMSSurveyCardState();
}

class _DOMSSurveyCardState extends State<DOMSSurveyCard> {
  late DOMSSurveyData _data;
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;
  bool _isExpanded = false;

  final List<MuscleGroup> _muscleGroups = [
    MuscleGroup('Chest', Icons.fitness_center, Colors.red),
    MuscleGroup('Back', Icons.accessibility_new, Colors.blue),
    MuscleGroup('Legs', Icons.directions_run, Colors.green),
    MuscleGroup('Arms', Icons.sports_martial_arts, Colors.orange),
    MuscleGroup('Shoulders', Icons.sports_gymnastics, Colors.purple),
    MuscleGroup('Core', Icons.center_focus_strong, Colors.teal),
  ];

  @override
  void initState() {
    super.initState();
    _data = widget.initialData ?? DOMSSurveyData();
    _notesController.text = _data.notes ?? '';
    _isExpanded = widget.isExpanded;
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Color _getSorenessColor(double value) {
    if (value <= 2) return Colors.green;
    if (value <= 4) return Colors.yellow.shade700;
    if (value <= 6) return Colors.orange;
    if (value <= 8) return Colors.red;
    return Colors.red.shade800;
  }

  Color _getWellnessColor(double value) {
    if (value >= 8) return Colors.green;
    if (value >= 6) return Colors.yellow.shade700;
    if (value >= 4) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      margin: const EdgeInsets.all(16),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeader(theme),
            if (_isExpanded) ...[
              const SizedBox(height: 24),
              _buildMuscleGroups(theme),
              const SizedBox(height: 24),
              _buildOverallSoreness(theme),
              const SizedBox(height: 24),
              _buildWellnessMetrics(theme),
              const SizedBox(height: 24),
              _buildNotesSection(theme),
              const SizedBox(height: 24),
              _buildActionButtons(theme),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: theme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            Icons.healing,
            color: theme.primaryColor,
            size: 24,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Daily Recovery Check',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'How are you feeling today?',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () {
            setState(() {
              _isExpanded = !_isExpanded;
            });
          },
          icon: Icon(
            _isExpanded ? Icons.expand_less : Icons.expand_more,
            size: 28,
          ),
        ),
      ],
    );
  }

  Widget _buildMuscleGroups(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Muscle Soreness',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Rate soreness from 0 (no soreness) to 10 (extreme soreness)',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 16),
        ...List.generate(_muscleGroups.length, (index) {
          final muscle = _muscleGroups[index];
          final value = _data.getSorenessForMuscle(muscle.name.toLowerCase());
          
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: _buildSorenessSlider(
              muscle,
              value,
              (newValue) {
                setState(() {
                  _data.setSorenessForMuscle(muscle.name.toLowerCase(), newValue);
                });
              },
            ),
          );
        }),
      ],
    );
  }

  Widget _buildSorenessSlider(
    MuscleGroup muscle,
    double value,
    Function(double) onChanged,
  ) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: muscle.color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            muscle.icon,
            color: muscle.color,
            size: 20,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    muscle.name,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: _getSorenessColor(value).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      value.round().toString(),
                      style: TextStyle(
                        color: _getSorenessColor(value),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  activeTrackColor: _getSorenessColor(value),
                  inactiveTrackColor: _getSorenessColor(value).withOpacity(0.3),
                  thumbColor: _getSorenessColor(value),
                  overlayColor: _getSorenessColor(value).withOpacity(0.2),
                  trackHeight: 4.0,
                  thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
                ),
                child: Slider(
                  value: value,
                  min: 0,
                  max: 10,
                  divisions: 10,
                  onChanged: onChanged,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOverallSoreness(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Overall Soreness',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),
        _buildSorenessSlider(
          MuscleGroup('Overall', Icons.person, Colors.grey),
          _data.overallSoreness,
          (value) {
            setState(() {
              _data.overallSoreness = value;
            });
          },
        ),
      ],
    );
  }

  Widget _buildWellnessMetrics(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'General Wellness',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Rate from 1 (very poor) to 10 (excellent)',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 16),
        _buildWellnessSlider(
          'Sleep Quality',
          Icons.bedtime,
          _data.sleepQuality,
          (value) {
            setState(() {
              _data.sleepQuality = value;
            });
          },
        ),
        const SizedBox(height: 16),
        _buildWellnessSlider(
          'Energy Level',
          Icons.battery_charging_full,
          _data.energyLevel,
          (value) {
            setState(() {
              _data.energyLevel = value;
            });
          },
        ),
        const SizedBox(height: 16),
        _buildWellnessSlider(
          'Motivation',
          Icons.trending_up,
          _data.motivation,
          (value) {
            setState(() {
              _data.motivation = value;
            });
          },
        ),
      ],
    );
  }

  Widget _buildWellnessSlider(
    String label,
    IconData icon,
    double value,
    Function(double) onChanged,
  ) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: _getWellnessColor(value).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            color: _getWellnessColor(value),
            size: 20,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    label,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: _getWellnessColor(value).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      value.round().toString(),
                      style: TextStyle(
                        color: _getWellnessColor(value),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  activeTrackColor: _getWellnessColor(value),
                  inactiveTrackColor: _getWellnessColor(value).withOpacity(0.3),
                  thumbColor: _getWellnessColor(value),
                  overlayColor: _getWellnessColor(value).withOpacity(0.2),
                  trackHeight: 4.0,
                  thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
                ),
                child: Slider(
                  value: value,
                  min: 1,
                  max: 10,
                  divisions: 9,
                  onChanged: onChanged,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNotesSection(ThemeData theme) {
    return TextField(
      controller: _notesController,
      maxLines: 3,
      decoration: InputDecoration(
        labelText: 'Additional Notes',
        hintText: 'Any specific symptoms, observations, or concerns?',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        filled: true,
        fillColor: theme.colorScheme.surfaceVariant.withOpacity(0.3),
      ),
    );
  }

  Widget _buildActionButtons(ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: _isSubmitting ? null : () {
              setState(() {
                _isExpanded = false;
              });
            },
            child: const Text('Cancel'),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton(
            onPressed: _isSubmitting ? null : _handleSubmit,
            child: _isSubmitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Submit Survey'),
          ),
        ),
      ],
    );
  }

  Future<void> _handleSubmit() async {
    setState(() {
      _isSubmitting = true;
    });

    try {
      _data.notes = _notesController.text.trim().isEmpty 
          ? null 
          : _notesController.text.trim();
      
      await widget.onSubmit(_data);
      
      if (mounted) {
        setState(() {
          _isExpanded = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit survey: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }
}

// Data classes
class DOMSSurveyData {
  double chestSoreness;
  double backSoreness;
  double legsSoreness;
  double armsSoreness;
  double shouldersSoreness;
  double coreSoreness;
  double overallSoreness;
  double sleepQuality;
  double energyLevel;
  double motivation;
  String? notes;

  DOMSSurveyData({
    this.chestSoreness = 0,
    this.backSoreness = 0,
    this.legsSoreness = 0,
    this.armsSoreness = 0,
    this.shouldersSoreness = 0,
    this.coreSoreness = 0,
    this.overallSoreness = 0,
    this.sleepQuality = 7,
    this.energyLevel = 7,
    this.motivation = 7,
    this.notes,
  });

  double getSorenessForMuscle(String muscle) {
    switch (muscle.toLowerCase()) {
      case 'chest': return chestSoreness;
      case 'back': return backSoreness;
      case 'legs': return legsSoreness;
      case 'arms': return armsSoreness;
      case 'shoulders': return shouldersSoreness;
      case 'core': return coreSoreness;
      default: return 0;
    }
  }

  void setSorenessForMuscle(String muscle, double value) {
    switch (muscle.toLowerCase()) {
      case 'chest': chestSoreness = value; break;
      case 'back': backSoreness = value; break;
      case 'legs': legsSoreness = value; break;
      case 'arms': armsSoreness = value; break;
      case 'shoulders': shouldersSoreness = value; break;
      case 'core': coreSoreness = value; break;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'chest_soreness': chestSoreness.round(),
      'back_soreness': backSoreness.round(),
      'legs_soreness': legsSoreness.round(),
      'arms_soreness': armsSoreness.round(),
      'shoulders_soreness': shouldersSoreness.round(),
      'core_soreness': coreSoreness.round(),
      'overall_soreness': overallSoreness.round(),
      'sleep_quality': sleepQuality.round(),
      'energy_level': energyLevel.round(),
      'motivation': motivation.round(),
      'notes': notes,
    };
  }
}

class MuscleGroup {
  final String name;
  final IconData icon;
  final Color color;

  MuscleGroup(this.name, this.icon, this.color);
}