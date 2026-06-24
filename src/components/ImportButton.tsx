'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import surveyData from '../data/surveys.json';

export default function ImportButton() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string>('');

  const importSurveyData = async () => {
    setImporting(true);
    setResult('Starting import...');
    
    try {
      // Get all questions from different categories
      const allQuestions: any[] = [];
      
      // Add detection questions
      allQuestions.push(...surveyData.detection_questions);
      
      // Add category-specific questions
      Object.entries(surveyData.surveys).forEach(([category, questions]) => {
        allQuestions.push(...questions);
      });
      
      setResult(`Found ${allQuestions.length} questions to import`);
      
      let questionOrder = 1;
      let imported = 0;
      
      for (const question of allQuestions) {
        // Determine category key
        let categoryKey = question.category;
        if (categoryKey === 'all') categoryKey = 'detection';
        
        // Check if question already exists
        const { data: existingQuestion } = await supabase
          .from('survey_questions')
          .select('id')
          .eq('question_id', question.id)
          .single();
        
        if (existingQuestion) {
          console.log(`Question ${question.id} already exists, skipping`);
          continue;
        }
        
        // Insert question
        const { data: questionData, error: questionError } = await supabase
          .from('survey_questions')
          .insert({
            question_id: question.id,
            category_key: categoryKey,
            question_text: question.text,
            ui_type: question.ui,
            weight: question.weight,
            is_required: question.required,
            is_crisis_detector: question.crisis,
            help_text: question.help_text,
            question_order: questionOrder++,
            show_if_previous_answers: question.follow_up ? JSON.stringify(question.follow_up) : null,
            is_active: true
          })
          .select()
          .single();
        
        if (questionError) {
          console.error(`Error inserting question ${question.id}:`, questionError);
          continue;
        }
        
        // Insert options for this question
        let optionOrder = 1;
        for (const option of question.options) {
          const { error: optionError } = await supabase
            .from('survey_question_options')
            .insert({
              question_id: questionData.id,
              option_id: option.id,
              option_text: option.label,
              score: option.score,
              is_crisis_flag: option.crisis || false,
              is_trust_issue: option.trust_issue || false,
              is_inverted_score: option.inverted || false,
              tags: JSON.stringify(option.tags),
              option_order: optionOrder++
            });
          
          if (optionError) {
            console.error(`Error inserting option ${option.id} for question ${question.id}:`, optionError);
          }
        }
        
        imported++;
        setResult(`Imported ${imported}/${allQuestions.length} questions...`);
      }
      
      setResult(`✅ Successfully imported ${imported} questions!`);
      
    } catch (error) {
      console.error('Import error:', error);
      setResult(`❌ Import failed: ${error}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Survey Data Import</h3>
      <button
        onClick={importSurveyData}
        disabled={importing}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {importing ? 'Importing...' : 'Import Survey Questions'}
      </button>
      {result && (
        <div className="mt-4 p-3 bg-white rounded border">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
