import * as React from "react";
import { useEffect, useState } from "react";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import SearchIcon from "@mui/icons-material/Search";
import { Checkbox, Paper, Switch, Modal, Box } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import {
  StyledTable,
  StyledTableCell,
  StyledTableHeaderCell,
} from "../../StyledTableComponents";
import { useAuth } from "../../../authentication/AuthContext";

const SWITCH_LABEL = { inputProps: { "aria-label": "Switch" } };
const CHECKBOX_LABEL = { inputProps: { "aria-label": "CheckBox" } };

export default function DataNavigationContentTable(props) {
  const { setAnyTargetVariableChecked } = props;
  const [data, setData] = useState([]);
  const [checkedIndex, setCheckedIndex] = useState(-1); // 체크된 체크박스의 인덱스

  const selectedData = getSelectedVarAndTarget();

  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const openModal = () => {
    setIsOpen(true);
    const signedUrl =
      "https://automl-file-storage-test.s3.ap-northeast-2.amazonaws.com/sample.png";
    setImageUrl(signedUrl);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  console.log(selectedData);
  useEffect(() => {
    props.setPayload(selectedData);
  }, [data]);

  useEffect(
    () => {
      const setUseAndTargetVariableData = props.data.map((it, idx) => {
        return {
          ...it,
          id: idx + 1,
          use: true,
          target_variable: false,
        };
      });

      setData(setUseAndTargetVariableData);
    },
    [props.data] // 변경될때마다 호출됨
  );

  function handleChangeSwitch(row, idx) {
    return () => {
      let copyOfData = JSON.parse(JSON.stringify(data));
      const use = data[idx].use;

      copyOfData[idx] = {
        ...row,
        use: !use,
        target_variable: false,
      };

      setData(copyOfData);
      handleNextButton(copyOfData);
    };
  }

  function handleChangeCheckbox(row, idx) {
    return () => {
      let copyOfData = JSON.parse(JSON.stringify(data));
      const targetVariable = data[idx].target_variable;
      const use = data[idx].use;

      // 이전에 선택된 목표 변수 해제
      if (checkedIndex !== -1 && checkedIndex !== idx) {
        copyOfData[checkedIndex] = {
          ...copyOfData[checkedIndex],
          target_variable: false,
        };
      }

      // 목표변수가 true일 경우 use도 true로 설정
      const updatedUse = !targetVariable ? true : use;

      copyOfData[idx] = {
        ...row,
        use: updatedUse,
        target_variable: !targetVariable,
      };

      setData(copyOfData);
      handleNextButton(copyOfData);

      // 체크된 체크박스의 인덱스를 업데이트
      if (targetVariable) {
        setCheckedIndex(-1); // 체크 해제
      } else {
        setCheckedIndex(idx); // 체크
      }
    };
  }
  console.log(data);

  function handleNextButton(copyOfData) {
    if (anyTargetVariableChecked(copyOfData)) {
      setAnyTargetVariableChecked(true);
    } else {
      setAnyTargetVariableChecked(false);
    }
  }

  function anyTargetVariableChecked(copyOfData) {
    return copyOfData.map((it) => it.target_variable).includes(true);
  }

  function getSelectedVarAndTarget() {
    const targetObj = data.find((row) => row.target_variable);
    const target = targetObj ? targetObj.col_name : "";
    const { user } = useAuth();

    const selected_var = data
      .filter((row) => row.use && row.col_name !== target)
      .map((row) => row.col_name);

    return {
      url: props.downloadUrl,
      selected_var: selected_var,
      target: target,
      result_id: props.resultId,
      user_id: user.id,
    };
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          height: "400px",
        }}
      >
        <StyledTable aria-label='data table' stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell align='left'></StyledTableHeaderCell>
              <StyledTableHeaderCell align='left'>아이디</StyledTableHeaderCell>
              <StyledTableHeaderCell align='left'>변수명</StyledTableHeaderCell>
              <StyledTableHeaderCell align='center'>
                변수유형
              </StyledTableHeaderCell>
              <StyledTableHeaderCell align='right'>
                최솟값
              </StyledTableHeaderCell>
              <StyledTableHeaderCell align='right'>
                최대값
              </StyledTableHeaderCell>
              <StyledTableHeaderCell align='right'>
                결측값
              </StyledTableHeaderCell>
              <StyledTableHeaderCell align='right'>평균</StyledTableHeaderCell>
              <StyledTableHeaderCell align='right'>
                중위수
              </StyledTableHeaderCell>
              <StyledTableHeaderCell align='right'>
                표준편차
              </StyledTableHeaderCell>
              <StyledTableHeaderCell align='right'>첨도</StyledTableHeaderCell>
              <StyledTableHeaderCell align='right'>왜도</StyledTableHeaderCell>
              <StyledTableHeaderCell align='center'>사용</StyledTableHeaderCell>
              <StyledTableHeaderCell align='center'>
                목표변수
              </StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={row.col_name}>
                <StyledTableCell align='left'>
                  <SearchIcon onClick={openModal} />
                </StyledTableCell>
                <StyledTableCell align='left'>{row.id}</StyledTableCell>
                <StyledTableCell align='left'>{row.col_name}</StyledTableCell>
                <StyledTableCell align='left'>{row.col_dtype}</StyledTableCell>
                <StyledTableCell align='right'>{row.min}</StyledTableCell>
                <StyledTableCell align='right'>{row.max}</StyledTableCell>
                <StyledTableCell align='right'>
                  {row.null_count}
                </StyledTableCell>
                <StyledTableCell align='right'>{row.mean}</StyledTableCell>
                <StyledTableCell align='right'>{row.median}</StyledTableCell>
                <StyledTableCell align='right'>{row.std}</StyledTableCell>
                <StyledTableCell align='right'>{row.kurtosis}</StyledTableCell>
                <StyledTableCell align='right'>{row.skew}</StyledTableCell>
                <StyledTableCell>
                  <Switch
                    {...SWITCH_LABEL}
                    checked={row.use}
                    onChange={handleChangeSwitch(row, idx)}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <Checkbox
                    {...CHECKBOX_LABEL}
                    checked={row.target_variable}
                    onChange={handleChangeCheckbox(row, idx)}
                  />
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>
      <Modal
        open={isOpen}
        onClose={closeModal}
        aria-labelledby='modal-title'
        aria-describedby='modal-description'
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          {imageUrl && <img src={imageUrl} alt='S3 이미지' />}
          <button onClick={closeModal}>확인</button>
        </Box>
      </Modal>
    </>
  );
}
