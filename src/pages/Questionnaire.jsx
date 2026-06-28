import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { DIMENSIONS, INDICATORS } from '../data/indicators';
import AssessmentRunner from '../components/assessment/AssessmentRunner';

// Solo assessment = the shared AssessmentRunner wired to useAppStore (localStorage
// answers), showing all dimensions. The group contributor renders the SAME
// component with only the analyst's assigned dimensions and a server-backed
// adapter, so the two look identical.
export default function Questionnaire() {
  const navigate = useNavigate();
  const answers = useAppStore(s => s.answers);
  const activeDimension = useAppStore(s => s.activeDimension);
  const activeSubDim = useAppStore(s => s.activeSubDim);
  const setAnswer = useAppStore(s => s.setAnswer);
  const setEvidence = useAppStore(s => s.setEvidence);
  const skipIndicator = useAppStore(s => s.skipIndicator);
  const unskipIndicator = useAppStore(s => s.unskipIndicator);
  const setActiveDimension = useAppStore(s => s.setActiveDimension);
  const setActiveSubDim = useAppStore(s => s.setActiveSubDim);
  const getDimScore = useAppStore(s => s.getDimScore);
  const getSubDimScore = useAppStore(s => s.getSubDimScore);
  const getEffectiveScore = useAppStore(s => s.getEffectiveScore);
  const isEvidenceCapped = useAppStore(s => s.isEvidenceCapped);
  const getSkipCount = useAppStore(s => s.getSkipCount);
  const getSkipLimit = useAppStore(s => s.getSkipLimit);
  const getCappedCount = useAppStore(s => s.getCappedCount);
  const getAnsweredCount = useAppStore(s => s.getAnsweredCount);
  const getDimStatus = useAppStore(s => s.getDimStatus);
  const isAssessmentComplete = useAppStore(s => s.isAssessmentComplete());

  return (
    <AssessmentRunner
      mode="solo"
      dims={Object.keys(DIMENSIONS)}
      answers={answers}
      activeDimension={activeDimension}
      activeSubDim={activeSubDim}
      onSelectDim={setActiveDimension}
      onSelectSub={setActiveSubDim}
      onScore={setAnswer}
      onSkip={skipIndicator}
      onUnskip={unskipIndicator}
      onEvidence={setEvidence}
      dimScore={getDimScore}
      subDimScore={getSubDimScore}
      effectiveScore={getEffectiveScore}
      isCapped={isEvidenceCapped}
      skipCount={getSkipCount}
      skipLimit={getSkipLimit}
      cappedCount={getCappedCount}
      answeredCount={getAnsweredCount}
      dimStatus={getDimStatus}
      totalIndicators={INDICATORS.length}
      complete={isAssessmentComplete}
      onViewResults={() => navigate('/results')}
    />
  );
}
