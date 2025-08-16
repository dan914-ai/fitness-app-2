import 'package:flutter/material.dart';

class SessionRPEModal extends StatefulWidget {
  final Function(int rpe, String? notes) onSubmit;
  final int? initialRPE;
  final String? initialNotes;

  const SessionRPEModal({
    Key? key,
    required this.onSubmit,
    this.initialRPE,
    this.initialNotes,
  }) : super(key: key);

  @override
  State<SessionRPEModal> createState() => _SessionRPEModalState();
}

class _SessionRPEModalState extends State<SessionRPEModal> {
  late double _rpeValue;
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;

  // RPE Scale descriptions
  final Map<int, String> _rpeDescriptions = {
    0: 'Rest - No exertion',
    1: 'Very, Very Light - Barely perceptible',
    2: 'Very Light - Light activity',
    3: 'Light - Easy pace',
    4: 'Light to Moderate - Comfortable',
    5: 'Moderate - Some effort required',
    6: 'Moderate to Hard - Noticeable effort',
    7: 'Hard - Difficult to maintain',
    8: 'Very Hard - Very difficult',
    9: 'Very, Very Hard - Near maximal',
    10: 'Maximal - Cannot continue',
  };

  @override
  void initState() {
    super.initState();
    _rpeValue = (widget.initialRPE ?? 5).toDouble();
    _notesController.text = widget.initialNotes ?? '';
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Color _getRPEColor(int rpe) {
    if (rpe <= 3) return Colors.green;
    if (rpe <= 5) return Colors.blue;
    if (rpe <= 7) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final rpeInt = _rpeValue.round();

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: MediaQuery.of(context).size.width * 0.9,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              children: [
                Icon(
                  Icons.fitness_center,
                  color: theme.primaryColor,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Rate Your Session',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'How did this workout feel overall?',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 32),

            // RPE Scale Display
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _getRPEColor(rpeInt).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _getRPEColor(rpeInt).withOpacity(0.3),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    rpeInt.toString(),
                    style: theme.textTheme.displayLarge?.copyWith(
                      color: _getRPEColor(rpeInt),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _rpeDescriptions[rpeInt] ?? '',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: _getRPEColor(rpeInt),
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // RPE Slider
            Column(
              children: [
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    activeTrackColor: _getRPEColor(rpeInt),
                    inactiveTrackColor: _getRPEColor(rpeInt).withOpacity(0.3),
                    thumbColor: _getRPEColor(rpeInt),
                    overlayColor: _getRPEColor(rpeInt).withOpacity(0.2),
                    trackHeight: 6.0,
                    thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 12),
                  ),
                  child: Slider(
                    value: _rpeValue,
                    min: 0,
                    max: 10,
                    divisions: 10,
                    onChanged: (value) {
                      setState(() {
                        _rpeValue = value;
                      });
                    },
                  ),
                ),
                const SizedBox(height: 8),
                
                // Scale indicators
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildScaleIndicator('0\nRest', Colors.green),
                    _buildScaleIndicator('3\nLight', Colors.blue),
                    _buildScaleIndicator('5\nModerate', Colors.orange),
                    _buildScaleIndicator('7\nHard', Colors.red),
                    _buildScaleIndicator('10\nMaximal', Colors.red.shade800),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Notes Section
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Notes (Optional)',
                hintText: 'How did the workout feel? Any specific observations?',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: theme.colorScheme.surfaceVariant.withOpacity(0.3),
              ),
            ),
            const SizedBox(height: 32),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isSubmitting 
                        ? null 
                        : () => Navigator.of(context).pop(),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _getRPEColor(rpeInt),
                      foregroundColor: Colors.white,
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Submit'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScaleIndicator(String label, Color color) {
    return Column(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: color,
            fontSize: 10,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Future<void> _handleSubmit() async {
    setState(() {
      _isSubmitting = true;
    });

    try {
      final notes = _notesController.text.trim();
      await widget.onSubmit(
        _rpeValue.round(),
        notes.isEmpty ? null : notes,
      );
      
      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit RPE: $e'),
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

// Helper function to show the modal
Future<void> showSessionRPEModal({
  required BuildContext context,
  required Function(int rpe, String? notes) onSubmit,
  int? initialRPE,
  String? initialNotes,
}) {
  return showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => SessionRPEModal(
      onSubmit: onSubmit,
      initialRPE: initialRPE,
      initialNotes: initialNotes,
    ),
  );
}